import * as React from 'react';
import uuid from 'uuid/v4';
import { shallowWithIntl } from '../helpers/_intl-enzyme-test-helper';
import {
  JiraQuickSearchContainer,
  Props,
} from '../../../components/jira/JiraQuickSearchContainer';
import QuickSearchContainer, {
  Props as QuickSearchContainerProps,
} from '../../../components/common/QuickSearchContainer';
import {
  noResultsCrossProductSearchClient,
  errorCrossProductSearchClient,
  mockCrossProductSearchClient,
} from '../mocks/_mockCrossProductSearchClient';
import {
  noResultsPeopleSearchClient,
  errorPeopleSearchClient,
  mockPeopleSearchClient,
} from '../mocks/_mockPeopleSearchClient';
import { mockLogger } from '../mocks/_mockLogger';
import {
  mockErrorJiraClient,
  mockJiraClientWithData,
  mockNoResultJiraClient,
} from '../mocks/_mockJiraClient';
import { makeJiraObjectResult, makePersonResult } from '../_test-util';
import { ContentType, GenericResultMap } from '../../../model/Result';
import { Scope } from '../../../api/types';
import * as SearchUtils from '../../../components/SearchResultsUtil';
import { ShallowWrapper } from 'enzyme';
import { CancelableEvent } from '../../../../../quick-search';
import {
  DEFAULT_AB_TEST,
  SearchResultsMap,
} from '../../../api/CrossProductSearchClient';
import { ReferralContextIdentifiers } from '../../../components/GlobalQuickSearchWrapper';

const issues = [
  makeJiraObjectResult({
    contentType: ContentType.JiraIssue,
  }),
  makeJiraObjectResult({
    contentType: ContentType.JiraIssue,
  }),
];
const boards = [
  makeJiraObjectResult({
    contentType: ContentType.JiraBoard,
  }),
];
const people = [makePersonResult(), makePersonResult(), makePersonResult()];
const referralContextIdentifiers: ReferralContextIdentifiers = {
  currentContainerId: '123-container',
  currentContentId: '123-content',
  searchReferrerId: '123-search-referrer',
};

describe('Jira Quick Search Container', () => {
  let createAnalyticsEventSpy: jest.Mock;
  let sessionId: string;
  const logger = mockLogger();
  const renderComponent = (partialProps?: Partial<Props>): ShallowWrapper => {
    const props: Props = {
      crossProductSearchClient: noResultsCrossProductSearchClient,
      peopleSearchClient: noResultsPeopleSearchClient,
      jiraClient: mockNoResultJiraClient(),
      logger,
      createAnalyticsEvent: createAnalyticsEventSpy,
      referralContextIdentifiers,
      linkComponent: undefined,
      onAdvancedSearch: undefined,
      appPermission: undefined,
      features: {
        abTest: DEFAULT_AB_TEST,
        disableJiraPreQueryPeopleSearch: false,
        enablePreQueryFromAggregator: false,
        searchExtensionsEnabled: false,
      },
      ...partialProps,
    };

    // @ts-ignore - doesn't recognise injected intl prop
    return shallowWithIntl(<JiraQuickSearchContainer {...props} />);
  };

  const getQuickSearchProperty = (
    wrapper: ShallowWrapper,
    property: keyof QuickSearchContainerProps<GenericResultMap>,
  ) => {
    const quickSearch = wrapper.find(QuickSearchContainer);
    const quickSearchProps = quickSearch.props() as QuickSearchContainerProps<
      GenericResultMap
    >;
    return quickSearchProps[property] as any;
  };

  beforeEach(() => {
    sessionId = uuid();
    createAnalyticsEventSpy = jest.fn();
  });

  afterEach(() => {
    createAnalyticsEventSpy.mockRestore();
    logger.reset();
  });

  it('should render quick search with correct props', () => {
    const wrapper = renderComponent();
    const quickSearch = wrapper.find(QuickSearchContainer);
    expect(quickSearch.props()).toMatchObject({
      placeholder: 'Search Jira',
      getPreQueryDisplayedResults: expect.any(Function),
      getPostQueryDisplayedResults: expect.any(Function),
      getSearchResultsComponent: expect.any(Function),
      getRecentItems: expect.any(Function),
      getSearchResults: expect.any(Function),
      handleSearchSubmit: expect.any(Function),
      createAnalyticsEvent: createAnalyticsEventSpy,
    });
  });

  describe('getRecentItems', () => {
    it('should not throw when recent promise throw', async () => {
      const error = new Error('something wrong');
      const jiraClient = mockErrorJiraClient(error);
      const getRecentItems = getQuickSearchProperty(
        renderComponent({ jiraClient }),
        'getRecentItems',
      );
      const { eagerRecentItemsPromise } = getRecentItems(sessionId);
      expect(jiraClient.getRecentItems).toHaveBeenCalledTimes(1);
      expect(await eagerRecentItemsPromise).toMatchObject({
        results: {
          objects: [],
          containers: [],
          people: [],
        },
      });
      expect(logger.safeError).toHaveBeenCalledTimes(1);
      expect(logger.safeError.mock.calls[0]).toMatchObject([
        'AK.GlobalSearch.JiraQuickSearchContainer',
        'error in recent Jira items promise',
        error,
      ]);
    });

    it('should not throw when people recent promise is rejected', async () => {
      const jiraClient = mockNoResultJiraClient();
      const getRecentItems = getQuickSearchProperty(
        renderComponent({
          jiraClient,
          peopleSearchClient: errorPeopleSearchClient,
        }),
        'getRecentItems',
      );
      const { eagerRecentItemsPromise } = getRecentItems(sessionId);
      expect(jiraClient.getRecentItems).toHaveBeenCalledTimes(1);
      expect(await eagerRecentItemsPromise).toMatchObject({
        results: {
          objects: [],
          containers: [],
          people: [],
        },
      });
      expect(logger.safeError).toHaveBeenCalledTimes(1);
      expect(logger.safeError.mock.calls[0]).toMatchObject([
        'AK.GlobalSearch.JiraQuickSearchContainer',
        'error in recently interacted people promise',
        'error',
      ]);
    });

    it('should return correct recent items', async () => {
      const jiraClient = mockJiraClientWithData([...issues, ...boards]);
      const peopleSearchClient = mockPeopleSearchClient({
        recentPeople: people,
        searchResultData: [],
      });

      const getRecentItems = getQuickSearchProperty(
        renderComponent({ jiraClient, peopleSearchClient }),
        'getRecentItems',
      );
      const {
        eagerRecentItemsPromise,
        lazyLoadedRecentItemsPromise,
      } = getRecentItems(sessionId);
      expect(jiraClient.getRecentItems).toHaveBeenCalledTimes(1);
      expect(await eagerRecentItemsPromise).toMatchObject({
        results: {
          objects: issues,
          containers: boards,
          people: people,
        },
      });

      expect(await lazyLoadedRecentItemsPromise).toEqual({});
      expect(logger.safeError).toHaveBeenCalledTimes(0);
    });

    it('should not return recent people if no browse permission', async () => {
      const jiraClient = mockJiraClientWithData([...issues, ...boards], false);
      const peopleSearchClient = mockPeopleSearchClient({
        recentPeople: people,
        searchResultData: [],
      });

      const getRecentItems = getQuickSearchProperty(
        renderComponent({ jiraClient, peopleSearchClient }),
        'getRecentItems',
      );
      const recentItems = await getRecentItems(sessionId)
        .eagerRecentItemsPromise;
      expect(jiraClient.getRecentItems).toHaveBeenCalledTimes(1);
      expect(recentItems).toMatchObject({
        results: {
          objects: issues,
          containers: boards,
          people: [],
        },
      });
      expect(logger.safeError).toHaveBeenCalledTimes(0);
    });
  });

  describe('getSearchResults', () => {
    it('should return an error when cross product search has error', async () => {
      const getSearchResults = getQuickSearchProperty(
        renderComponent({
          crossProductSearchClient: errorCrossProductSearchClient,
        }),
        'getSearchResults',
      );

      try {
        await getSearchResults('query', sessionId, 100, 0);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('should call cross product search client with correct query version', async () => {
      const searchSpy = jest.spyOn(noResultsCrossProductSearchClient, 'search');
      const dummyQueryVersion = 123;

      const modelParams = [
        {
          '@type': 'queryParams',
          queryVersion: dummyQueryVersion,
        },
        {
          '@type': 'currentProject',
          projectId: '123-container',
        },
      ];

      const getSearchResults = getQuickSearchProperty(
        renderComponent({
          crossProductSearchClient: noResultsCrossProductSearchClient,
        }),
        'getSearchResults',
      );

      getSearchResults('query', sessionId, 100, dummyQueryVersion);

      expect(searchSpy).toHaveBeenCalledWith(
        'query',
        sessionId,
        expect.any(Array),
        modelParams,
        expect.any(Number),
      );

      searchSpy.mockRestore();
    });

    it('should return search results', async () => {
      const peopleSearchClient = mockPeopleSearchClient({
        recentPeople: [],
        searchResultData: people,
      });

      const resultsMap = {} as SearchResultsMap;
      resultsMap[Scope.JiraIssue] = {
        items: issues,
        totalSize: issues.length,
      };
      resultsMap[Scope.JiraBoardProjectFilter] = {
        items: boards,
        totalSize: boards.length,
      };
      const crossProductSearchClient = mockCrossProductSearchClient(
        {
          results: resultsMap,
        },
        DEFAULT_AB_TEST,
      );
      const getSearchResults = getQuickSearchProperty(
        renderComponent({ peopleSearchClient, crossProductSearchClient }),
        'getSearchResults',
      );
      const searchResults = await getSearchResults('query', sessionId, 100, 0);
      expect(searchResults).toMatchObject({
        results: {
          objects: issues,
          containers: boards,
        },
        timings: {
          crossProductSearchElapsedMs: expect.any(Number),
          peopleElapsedMs: expect.any(Number),
        },
      });
      expect(logger.safeError).toHaveBeenCalledTimes(0);
    });

    it('should not return people search results if no browse permission', async () => {
      const peopleSearchClient = mockPeopleSearchClient({
        recentPeople: [],
        searchResultData: people,
      });

      const resultsMap = {} as SearchResultsMap;
      resultsMap[Scope.JiraIssue] = {
        items: issues,
        totalSize: issues.length,
      };
      resultsMap[Scope.JiraBoardProjectFilter] = {
        items: boards,
        totalSize: boards.length,
      };

      const crossProductSearchClient = mockCrossProductSearchClient(
        {
          results: resultsMap,
          abTest: DEFAULT_AB_TEST,
        },
        DEFAULT_AB_TEST,
      );
      const getSearchResults = getQuickSearchProperty(
        renderComponent({
          peopleSearchClient,
          crossProductSearchClient,
          jiraClient: mockNoResultJiraClient(false),
        }),
        'getSearchResults',
      );
      const searchResults = await getSearchResults('query', sessionId, 100, 0);
      expect(searchResults).toMatchObject({
        results: {
          objects: issues,
          containers: boards,
          people: [],
        },
        timings: {
          crossProductSearchElapsedMs: expect.any(Number),
          peopleElapsedMs: expect.any(Number),
        },
      });
      expect(logger.safeError).toHaveBeenCalledTimes(0);
    });

    describe('Advanced Search callback', () => {
      let redirectSpy: jest.SpyInstance<
        (entityType: SearchUtils.JiraEntityTypes, query?: string) => void
      >;
      let originalWindowLocation = window.location;

      beforeEach(() => {
        delete window.location;
        window.location = Object.assign({}, window.location, {
          assign: jest.fn(),
        });
        redirectSpy = jest.spyOn(SearchUtils, 'redirectToJiraAdvancedSearch');
      });

      afterEach(() => {
        window.location = originalWindowLocation;
        redirectSpy.mockReset();
        redirectSpy.mockRestore();
      });

      const mountComponent = (
        spy:
          | jest.Mock<{}>
          | jest.Mock<any>
          | ((
              e: CancelableEvent,
              entity: string,
              query: string,
              searchSessionId: string,
            ) => void)
          | undefined,
      ) => {
        const wrapper = renderComponent({
          onAdvancedSearch: spy,
        });
        const quickSearchContainer = wrapper.find(QuickSearchContainer);

        const props = quickSearchContainer.props() as any;
        expect(props).toHaveProperty('handleSearchSubmit');

        return props['handleSearchSubmit'];
      };
      const mockEvent = () => ({
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: {
          value: 'query',
        },
      });
      const mockSearchSessionId = 'someSearchSessionId';

      it('should call onAdvancedSearch call', () => {
        const spy = jest.fn();
        const handleSearchSubmit = mountComponent(spy);
        const mockedEvent = mockEvent();
        handleSearchSubmit(mockedEvent, mockSearchSessionId);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            preventDefault: expect.any(Function),
          }),
          'issues',
          'query',
          mockSearchSessionId,
        );
        expect(mockedEvent.preventDefault).toHaveBeenCalledTimes(0);
        expect(mockedEvent.stopPropagation).toHaveBeenCalledTimes(0);
        expect(redirectSpy).toHaveBeenCalledTimes(1);
      });

      it('should not call redriect', () => {
        const spy = jest.fn(e => e.preventDefault());
        const handleSearchSubmit = mountComponent(spy);
        const mockedEvent = mockEvent();
        handleSearchSubmit(mockedEvent, mockSearchSessionId);

        expect(mockedEvent.preventDefault).toHaveBeenCalledTimes(1);
        expect(mockedEvent.stopPropagation).toHaveBeenCalledTimes(1);
        expect(redirectSpy).toHaveBeenCalledTimes(0);
      });
    });
  });
});
