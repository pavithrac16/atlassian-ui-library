import * as React from 'react';
import {
  injectIntl,
  InjectedIntlProps,
  FormattedHTMLMessage,
} from 'react-intl';
import styled from 'styled-components';
import { gridSize } from '@atlaskit/theme';
import { withAnalytics } from '@atlaskit/analytics';
import { withAnalyticsEvents } from '@atlaskit/analytics-next';
import { CancelableEvent } from '@atlaskit/quick-search';
import StickyFooter from '../common/StickyFooter';
import { CreateAnalyticsEventFn } from '../analytics/types';
import { SearchScreenCounter } from '../../util/ScreenCounter';
import { JiraClient } from '../../api/JiraClient';
import { PeopleSearchClient } from '../../api/PeopleSearchClient';
import { Scope } from '../../api/types';
import {
  LinkComponent,
  ReferralContextIdentifiers,
  Logger,
  JiraApplicationPermission,
} from '../GlobalQuickSearchWrapper';
import QuickSearchContainer, {
  SearchResultProps,
  PartiallyLoadedRecentItems,
} from '../common/QuickSearchContainer';
import { messages } from '../../messages';
import SearchResultsComponent from '../common/SearchResults';
import NoResultsState from './NoResultsState';
import JiraAdvancedSearch from './JiraAdvancedSearch';
import {
  mapRecentResultsToUIGroups,
  mapSearchResultsToUIGroups,
} from './JiraSearchResultsMapper';
import {
  handlePromiseError,
  JiraEntityTypes,
  redirectToJiraAdvancedSearch,
  ADVANCED_JIRA_SEARCH_RESULT_ID,
} from '../SearchResultsUtil';
import {
  ContentType,
  JiraResult,
  Result,
  ResultsWithTiming,
  GenericResultMap,
  JiraResultsMap,
  AnalyticsType,
} from '../../model/Result';
import { getUniqueResultId } from '../ResultList';
import {
  CrossProductSearchClient,
  CrossProductSearchResults,
} from '../../api/CrossProductSearchClient';
import performanceNow from '../../util/performance-now';
import {
  fireSelectedAdvancedSearch,
  AdvancedSearchSelectedEvent,
} from '../../util/analytics-event-helper';
import AdvancedIssueSearchLink from './AdvancedIssueSearchLink';
import { getJiraMaxObjects } from '../../util/experiment-utils';
import { buildJiraModelParams } from '../../util/model-parameters';
import { JiraFeatures } from '../../util/features';

const JIRA_RESULT_LIMIT = 6;
const JIRA_PREQUERY_RESULT_LIMIT = 10;

const NoResultsAdvancedSearchContainer = styled.div`
  margin-top: ${4 * gridSize()}px;
`;

const BeforePreQueryStateContainer = styled.div`
  margin-top: ${gridSize()}px;
`;

/**
 * NOTE: This component is only consumed internally as such avoid using optional props
 * i.e. instead of "propX?: something" use "propX: something | undefined"
 *
 * This improves type safety and prevent us from accidentally forgetting a parameter.
 */
export interface Props {
  createAnalyticsEvent: CreateAnalyticsEventFn | undefined;
  linkComponent: LinkComponent | undefined;
  referralContextIdentifiers: ReferralContextIdentifiers | undefined;
  jiraClient: JiraClient;
  peopleSearchClient: PeopleSearchClient;
  crossProductSearchClient: CrossProductSearchClient;
  logger: Logger;
  onAdvancedSearch:
    | undefined
    | ((
        e: CancelableEvent,
        entity: string,
        query: string,
        searchSessionId: string,
      ) => void);
  appPermission: JiraApplicationPermission | undefined;
  features: JiraFeatures;
}

const contentTypeToSection = {
  [ContentType.JiraIssue]: 'issues',
  [ContentType.JiraBoard]: 'boards',
  [ContentType.JiraFilter]: 'filters',
  [ContentType.JiraProject]: 'projects',
};

const SCOPES = [Scope.JiraIssue, Scope.JiraBoardProjectFilter];

export interface State {
  selectedAdvancedSearchType: JiraEntityTypes;
  selectedResultId?: string;
}

const LOGGER_NAME = 'AK.GlobalSearch.JiraQuickSearchContainer';

/**
 * Container/Stateful Component that handles the data fetching and state handling when the user interacts with Search.
 */
export class JiraQuickSearchContainer extends React.Component<
  Props & InjectedIntlProps,
  State
> {
  state: State = {
    selectedAdvancedSearchType: JiraEntityTypes.Issues,
  };

  screenCounters = {
    preQueryScreenCounter: new SearchScreenCounter(),
    postQueryScreenCounter: new SearchScreenCounter(),
  };

  handleSearchSubmit = (
    event: React.KeyboardEvent<HTMLInputElement>,
    searchSessionId: string,
  ) => {
    const { onAdvancedSearch = () => {} } = this.props;
    const target = event.target as HTMLInputElement;
    const query = target.value;
    let defaultPrevented = false;

    onAdvancedSearch(
      Object.assign({}, event, {
        preventDefault() {
          defaultPrevented = true;
          event.preventDefault();
          event.stopPropagation();
        },
        stopPropagation() {},
      }),
      this.state.selectedAdvancedSearchType,
      query,
      searchSessionId,
    );

    if (!defaultPrevented) {
      redirectToJiraAdvancedSearch(
        this.state.selectedAdvancedSearchType,
        query,
      );
    }
  };

  handleAdvancedSearch = (
    event: CancelableEvent,
    entity: string,
    query: string,
    searchSessionId: string,
    analyticsData: Object,
    isLoading: boolean,
  ) => {
    const {
      referralContextIdentifiers,
      onAdvancedSearch = () => {},
    } = this.props;
    const eventData = {
      resultId: ADVANCED_JIRA_SEARCH_RESULT_ID,
      ...analyticsData,
      query,
      // queryversion is missing
      contentType: entity,
      type: AnalyticsType.AdvancedSearchJira,
      isLoading,
    } as AdvancedSearchSelectedEvent;

    fireSelectedAdvancedSearch(
      eventData,
      searchSessionId,
      referralContextIdentifiers,
      this.props.createAnalyticsEvent,
    );
    onAdvancedSearch(event, entity, query, searchSessionId);
  };

  getPreQueryDisplayedResults = (
    recentItems: GenericResultMap | null,
    searchSessionId: string,
  ) => {
    const { features } = this.props;

    return mapRecentResultsToUIGroups(
      recentItems as JiraResultsMap,
      searchSessionId,
      features,
      this.props.appPermission,
    );
  };

  getPostQueryDisplayedResults = (
    searchResults: GenericResultMap | null,
    query: string,
    searchSessionId: string,
  ) => {
    const { features } = this.props;

    return mapSearchResultsToUIGroups(
      searchResults as JiraResultsMap,
      searchSessionId,
      features,
      this.props.appPermission,
      query,
    );
  };

  getSearchResultsComponent = ({
    retrySearch,
    latestSearchQuery,
    isError,
    searchResults,
    isLoading,
    recentItems,
    keepPreQueryState,
    searchSessionId,
    searchMore,
  }: SearchResultProps<GenericResultMap>) => {
    const query = latestSearchQuery;
    const {
      referralContextIdentifiers,
      onAdvancedSearch = () => {},
      appPermission,
    } = this.props;

    return (
      <SearchResultsComponent
        query={query}
        isPreQuery={!query}
        isError={isError}
        isLoading={isLoading}
        retrySearch={retrySearch}
        keepPreQueryState={keepPreQueryState}
        searchSessionId={searchSessionId}
        {...this.screenCounters}
        referralContextIdentifiers={referralContextIdentifiers}
        searchMore={searchMore}
        renderNoRecentActivity={() => (
          <>
            <FormattedHTMLMessage {...messages.jira_no_recent_activity_body} />
            <NoResultsAdvancedSearchContainer>
              <JiraAdvancedSearch
                appPermission={appPermission}
                query={query}
                analyticsData={{ resultsCount: 0, wasOnNoResultsScreen: true }}
                onClick={(mouseEvent, entity) =>
                  this.handleAdvancedSearch(
                    mouseEvent,
                    entity,
                    query,
                    searchSessionId,
                    { resultsCount: 0, wasOnNoResultsScreen: true },
                    isLoading,
                  )
                }
              />
            </NoResultsAdvancedSearchContainer>
          </>
        )}
        renderAdvancedSearchGroup={(analyticsData?) => (
          <StickyFooter style={{ marginTop: `${2 * gridSize()}px` }}>
            <JiraAdvancedSearch
              appPermission={appPermission}
              analyticsData={analyticsData}
              query={query}
              onClick={(mouseEvent, entity) =>
                this.handleAdvancedSearch(
                  mouseEvent,
                  entity,
                  query,
                  searchSessionId,
                  analyticsData,
                  isLoading,
                )
              }
            />
          </StickyFooter>
        )}
        renderBeforePreQueryState={() => (
          <BeforePreQueryStateContainer>
            <AdvancedIssueSearchLink
              onClick={({ event }) =>
                onAdvancedSearch(
                  event,
                  JiraEntityTypes.Issues,
                  query,
                  searchSessionId,
                )
              }
            />
          </BeforePreQueryStateContainer>
        )}
        getPreQueryGroups={() =>
          this.getPreQueryDisplayedResults(recentItems, searchSessionId)
        }
        getPostQueryGroups={() =>
          this.getPostQueryDisplayedResults(
            searchResults,
            query,
            searchSessionId,
          )
        }
        renderNoResult={() => (
          <NoResultsState
            query={query}
            onAdvancedSearch={(mouseEvent, entity) =>
              this.handleAdvancedSearch(
                mouseEvent,
                entity,
                query,
                searchSessionId,
                { resultsCount: 0, wasOnNoResultsScreen: true },
                isLoading,
              )
            }
          />
        )}
      />
    );
  };

  getRecentlyInteractedPeople = (): Promise<Result[]> => {
    /*
      the following code is temporarily feature flagged for performance reasons and will be shortly reinstated.
      https://product-fabric.atlassian.net/browse/QS-459
    */
    if (this.props.features.disableJiraPreQueryPeopleSearch) {
      return Promise.resolve([]);
    } else {
      const peoplePromise: Promise<
        Result[]
      > = this.props.peopleSearchClient.getRecentPeople();
      return handlePromiseError<Result[]>(
        peoplePromise,
        [] as Result[],
        error =>
          this.props.logger.safeError(
            LOGGER_NAME,
            'error in recently interacted people promise',
            error,
          ),
      ) as Promise<Result[]>;
    }
  };

  getRecentItemsFromJira = (sessionId: string): Promise<GenericResultMap> => {
    return this.props.jiraClient
      .getRecentItems(sessionId)
      .then(items =>
        items.reduce<GenericResultMap<JiraResult>>((acc, item) => {
          if (item.contentType) {
            const section =
              contentTypeToSection[
                item.contentType as keyof typeof contentTypeToSection
              ];
            acc[section] = ([] as JiraResult[]).concat(
              acc[section] || [],
              item,
            );
          }
          return acc;
        }, {}),
      )
      .then(({ issues = [], boards = [], projects = [], filters = [] }) => ({
        objects: issues,
        containers: [...boards, ...projects, ...filters],
      }));
  };

  getRecentItemsFromXpsearch = (
    sessionId: string,
  ): Promise<GenericResultMap> => {
    const { features } = this.props;

    return this.props.crossProductSearchClient
      .search(
        '',
        sessionId,
        SCOPES,
        [],
        getJiraMaxObjects(features.abTest, JIRA_PREQUERY_RESULT_LIMIT),
      )
      .then(xpRecentResults => {
        const objects = xpRecentResults.results[Scope.JiraIssue];
        const containers =
          xpRecentResults.results[Scope.JiraBoardProjectFilter];

        return {
          objects: objects ? objects.items : [],
          containers: containers ? containers.items : [],
        };
      });
  };

  getJiraRecentItems = (sessionId: string): Promise<GenericResultMap> => {
    const { features } = this.props;
    const recentItemsPromise = features.enablePreQueryFromAggregator
      ? this.getRecentItemsFromXpsearch(sessionId)
      : this.getRecentItemsFromJira(sessionId);
    return handlePromiseError(
      recentItemsPromise,
      {
        objects: [],
        containers: [],
      },
      error =>
        this.props.logger.safeError(
          LOGGER_NAME,
          'error in recent Jira items promise',
          error,
        ),
    );
  };

  canSearchUsers = (): Promise<boolean> => {
    /*
      the following code is temporarily feature flagged for performance reasons and will be shortly reinstated.
      https://product-fabric.atlassian.net/browse/QS-459
    */
    if (this.props.features.disableJiraPreQueryPeopleSearch) {
      return Promise.resolve(false);
    } else {
      return handlePromiseError(
        this.props.jiraClient.canSearchUsers(),
        false,
        error =>
          this.props.logger.safeError(
            LOGGER_NAME,
            'error fetching browse user permission',
            error,
          ),
      );
    }
  };

  getRecentItems = (
    sessionId: string,
  ): PartiallyLoadedRecentItems<GenericResultMap> => {
    return {
      eagerRecentItemsPromise: Promise.all([
        this.getJiraRecentItems(sessionId),
        this.getRecentlyInteractedPeople(),
        this.canSearchUsers(),
      ])
        .then(([jiraItems, people, canSearchUsers]) => {
          return { ...jiraItems, people: canSearchUsers ? people : [] };
        })
        .then(results => ({ results } as ResultsWithTiming<GenericResultMap>)),
      lazyLoadedRecentItemsPromise: Promise.resolve({}),
    };
  };

  getSearchResults = (
    query: string,
    sessionId: string,
    startTime: number,
    queryVersion: number,
  ): Promise<ResultsWithTiming<GenericResultMap>> => {
    const { features } = this.props;

    const crossProductSearchPromise = this.props.crossProductSearchClient.search(
      query,
      sessionId,
      SCOPES,
      buildJiraModelParams(
        queryVersion,
        this.props.referralContextIdentifiers &&
          this.props.referralContextIdentifiers.currentContainerId,
      ),
      getJiraMaxObjects(features.abTest, JIRA_RESULT_LIMIT),
    );

    const searchPeoplePromise = Promise.resolve([] as Result[]);

    const mapPromiseToPerformanceTime = (p: Promise<any>) =>
      p.then(() => performanceNow() - startTime);

    return Promise.all<
      CrossProductSearchResults,
      Result[],
      number,
      number,
      boolean
    >([
      crossProductSearchPromise,
      searchPeoplePromise,
      mapPromiseToPerformanceTime(crossProductSearchPromise),
      mapPromiseToPerformanceTime(searchPeoplePromise),
      this.canSearchUsers(),
    ]).then(
      ([
        xpsearchResults,
        peopleResults,
        crossProductSearchElapsedMs,
        peopleElapsedMs,
        canSearchPeople,
      ]) => {
        const objects = xpsearchResults.results[Scope.JiraIssue];
        const containers =
          xpsearchResults.results[Scope.JiraBoardProjectFilter];

        const objectItems = objects ? objects.items : [];

        this.highlightMatchingFirstResult(query, objectItems as JiraResult[]);

        return {
          results: {
            objects: objectItems,
            containers: containers ? containers.items : [],
            people: canSearchPeople ? peopleResults : [],
          },
          timings: {
            crossProductSearchElapsedMs,
            peopleElapsedMs,
          },

          abTest: xpsearchResults.abTest,
        };
      },
    );
  };

  highlightMatchingFirstResult(query: string, issueResults: JiraResult[]) {
    if (
      issueResults &&
      issueResults.length > 0 &&
      typeof issueResults[0].objectKey === 'string' &&
      (issueResults[0].objectKey!.toLowerCase() === query.toLowerCase() ||
        (!!+query &&
          issueResults[0].objectKey!.toLowerCase().endsWith(`${-query}`)))
    ) {
      this.setState({
        selectedResultId: getUniqueResultId(issueResults[0]),
      });
    }
  }

  handleSelectedResultIdChanged(newSelectedId?: string) {
    this.setState({
      selectedResultId: newSelectedId,
    });
  }

  render() {
    const {
      linkComponent,
      createAnalyticsEvent,
      logger,
      features,
      referralContextIdentifiers,
    } = this.props;
    const { selectedResultId } = this.state;

    return (
      <QuickSearchContainer
        placeholder={this.props.intl.formatMessage(
          messages.jira_search_placeholder,
        )}
        linkComponent={linkComponent}
        getPreQueryDisplayedResults={(recentItems, searchSessionId) =>
          this.getPreQueryDisplayedResults(recentItems, searchSessionId)
        }
        getPostQueryDisplayedResults={(
          searchResults,
          query,
          _recentItems,
          _isLoading,
          searchSessionId,
        ) =>
          this.getPostQueryDisplayedResults(
            searchResults,
            query,
            searchSessionId,
          )
        }
        getSearchResultsComponent={this.getSearchResultsComponent}
        getRecentItems={this.getRecentItems}
        getSearchResults={this.getSearchResults}
        handleSearchSubmit={this.handleSearchSubmit}
        createAnalyticsEvent={createAnalyticsEvent}
        logger={logger}
        selectedResultId={selectedResultId}
        onSelectedResultIdChanged={(newId: any) =>
          this.handleSelectedResultIdChanged(newId)
        }
        enablePreQueryFromAggregator={features.enablePreQueryFromAggregator}
        referralContextIdentifiers={referralContextIdentifiers}
        product="jira"
        features={features}
      />
    );
  }
}

const JiraQuickSearchContainerWithIntl = injectIntl<Props>(
  withAnalytics(JiraQuickSearchContainer, {}, {}),
);

export default withAnalyticsEvents()(JiraQuickSearchContainerWithIntl);
