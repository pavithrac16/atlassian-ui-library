import {
  Result,
  PersonResult,
  ResultType,
  AnalyticsType,
  ContentType,
  Results,
  PeopleResults,
  ConfluenceObjectResults,
} from '../model/Result';
import { mapJiraItemToResult } from './JiraItemMapper';
import { mapConfluenceItemToResult } from './ConfluenceItemMapper';
import {
  RequestServiceOptions,
  ServiceConfig,
  utils,
} from '@atlaskit/util-service-support';
import {
  Scope,
  ConfluenceItem,
  JiraItem,
  PersonItem,
  QuickSearchContext,
  UrsPersonItem,
} from './types';
import { ModelParam } from '../util/model-parameters';
import { GlobalSearchPrefetchedResults } from './prefetchResults';

export const DEFAULT_AB_TEST: ABTest = Object.freeze({
  experimentId: 'default',
  abTestId: 'default',
  controlId: 'default',
});

type PeopleScopes = Scope.People | Scope.UserConfluence | Scope.UserJira;
type ConfluenceObjectScopes =
  | Scope.ConfluencePageBlogAttachment
  | Scope.ConfluencePageBlog;
type ConfluenceContainerResults = Scope.ConfluenceSpace;

/**
 * Eventually we want all the scopes to be typed in some way
 */
export type TypePeopleResults = {
  [S in PeopleScopes]: PeopleResults | undefined
};

export type TypeConfluenceObjectResults = {
  [S in ConfluenceObjectScopes]: ConfluenceObjectResults | undefined
};

export type TypeConfluenceContainerResults = {
  [S in ConfluenceContainerResults]: Results | undefined
};

/**
 * Temporary type as we start typing all our results
 */
export type GenericResults = {
  [S in Exclude<Scope, PeopleScopes>]: Results | undefined
};

/**
 * Note that this type ONLY provides types when retrieving objects given a key.
 * It does NOT have much type safety when it comes to assigning the values to a key.
 *
 * e.g.
 * typeof results[Scope.People] == PeopleResults (i.e provides type safety)
 *
 * but the following will also not throw any typescript warnings.
 *
 * const scope: Scope = Scope.People;
 * results[scope] = new Result()
 */
export type SearchResultsMap = GenericResults &
  TypePeopleResults &
  TypeConfluenceObjectResults &
  TypeConfluenceContainerResults;

export type CrossProductSearchResults = {
  results: SearchResultsMap;
  abTest?: ABTest;
};

export const EMPTY_CROSS_PRODUCT_SEARCH_RESPONSE: CrossProductSearchResults = {
  results: {} as SearchResultsMap,
};

export interface CrossProductSearchResponse {
  scopes: ScopeResult[];
}

export interface CrossProductExperimentResponse {
  scopes: Experiment[];
}

export type SearchItem = ConfluenceItem | JiraItem | PersonItem | UrsPersonItem;

export interface ABTest {
  abTestId: string;
  controlId: string;
  experimentId: string;
}

export interface ScopeResult {
  id: Scope;
  error?: string;
  results: SearchItem[];
  abTest?: ABTest; // in case of an error abTest will be undefined
  size?: number;
}

export interface Experiment {
  id: Scope;
  error?: string;
  abTest: ABTest;
}

export interface PrefetchedData {
  abTest: Promise<ABTest> | undefined;
}

export interface CrossProductSearchClient {
  search(
    query: string,
    sessionId: string,
    scopes: Scope[],
    modelParams: ModelParam[],
    resultLimit?: number | null,
  ): Promise<CrossProductSearchResults>;
  getPeople(
    query: string,
    sessionId: string,
    currentQuickSearchContext: QuickSearchContext,
    resultLimit?: number,
  ): Promise<CrossProductSearchResults>;
  getAbTestData(scope: Scope): Promise<ABTest>;
  getAbTestDataForProduct(product: QuickSearchContext): Promise<ABTest>;
}

export default class CachingCrossProductSearchClientImpl
  implements CrossProductSearchClient {
  private serviceConfig: ServiceConfig;
  private cloudId: string;
  private abTestDataCache: { [scope: string]: Promise<ABTest> };
  private bootstrapPeopleCache: Promise<CrossProductSearchResults> | undefined;

  // result limit per scope
  private readonly RESULT_LIMIT = 10;

  constructor(
    url: string,
    cloudId: string,
    prefetchResults: GlobalSearchPrefetchedResults | undefined,
  ) {
    this.serviceConfig = { url: url };
    this.cloudId = cloudId;
    this.abTestDataCache = prefetchResults ? prefetchResults.abTestPromise : {};
  }

  public async getPeople(
    query: string,
    sessionId: string,
    currentQuickSearchContext: QuickSearchContext,
    resultLimit: number = 3,
  ): Promise<CrossProductSearchResults> {
    const isBootstrapQuery = !query;

    // We will use the bootstrap people cache if the query is a bootstrap query and there is a result cached
    if (isBootstrapQuery && this.bootstrapPeopleCache) {
      return this.bootstrapPeopleCache;
    }

    const scope: Scope.UserConfluence | Scope.UserJira | null =
      currentQuickSearchContext === 'confluence'
        ? Scope.UserConfluence
        : currentQuickSearchContext === 'jira'
        ? Scope.UserJira
        : null;

    if (scope) {
      const searchPromise = this.search(
        query,
        sessionId,
        [scope],
        [],
        resultLimit,
      );

      if (isBootstrapQuery) {
        this.bootstrapPeopleCache = searchPromise;
      }

      return searchPromise;
    }

    return {
      results: {} as SearchResultsMap,
    };
  }

  public async search(
    query: string,
    sessionId: string,
    scopes: Scope[],
    modelParams: ModelParam[],
    resultLimit?: number | null,
  ): Promise<CrossProductSearchResults> {
    const path = 'quicksearch/v1';

    const body = {
      query: query,
      cloudId: this.cloudId,
      limit: resultLimit || this.RESULT_LIMIT,
      scopes: scopes,
      ...(modelParams.length > 0 ? { modelParams } : {}),
    };

    const response = await this.makeRequest<CrossProductSearchResponse>(
      path,
      body,
    );
    return this.parseResponse(response);
  }

  public async getAbTestDataForProduct(product: QuickSearchContext) {
    let scope: Scope;

    switch (product) {
      case 'confluence':
        scope = Scope.ConfluencePageBlogAttachment;
        break;
      case 'jira':
        scope = Scope.JiraIssue;
        break;
      default:
        throw new Error('Invalid product for abtest');
    }

    return await this.getAbTestData(scope);
  }

  /**
   * @deprecated use {getAbTestDataForProduct} instead. Using manually defined scopes here can
   * break caching behaviour.
   *
   * This will be moved into private scope in the near future.
   */
  public async getAbTestData(scope: Scope): Promise<ABTest> {
    if (this.abTestDataCache[scope]) {
      return this.abTestDataCache[scope];
    }

    const path = 'experiment/v1';
    const body = {
      cloudId: this.cloudId,
      scopes: [scope],
    };

    const response = await this.makeRequest<CrossProductExperimentResponse>(
      path,
      body,
    );

    const scopeWithAbTest: Experiment | undefined = response.scopes.find(
      s => s.id === scope,
    );

    const abTestPromise = scopeWithAbTest
      ? Promise.resolve(scopeWithAbTest.abTest)
      : Promise.resolve(DEFAULT_AB_TEST);

    this.abTestDataCache[scope] = abTestPromise;

    return abTestPromise;
  }

  private async makeRequest<T>(path: string, body: object): Promise<T> {
    const options: RequestServiceOptions = {
      path,
      requestInit: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    };

    return utils.requestService<T>(this.serviceConfig, options);
  }

  /**
   * Converts the raw xpsearch-aggregator response into a CrossProductSearchResults object containing
   * the results set and the experimentId that generated them.
   *
   * @param response
   * @param searchSessionId
   * @returns a CrossProductSearchResults object
   */
  private parseResponse(
    response: CrossProductSearchResponse,
  ): CrossProductSearchResults {
    let abTest: ABTest | undefined;
    const results: SearchResultsMap = response.scopes
      .filter(scope => scope.results)
      .reduce(
        (resultsMap, scopeResult) => {
          const items = scopeResult.results.map(result =>
            mapItemToResult(scopeResult.id as Scope, result),
          );

          resultsMap[scopeResult.id] = {
            items,
            totalSize:
              scopeResult.size !== undefined ? scopeResult.size : items.length,
          };

          if (!abTest) {
            abTest = scopeResult.abTest;
          }
          return resultsMap;
        },
        {} as SearchResultsMap,
      );

    return { results, abTest };
  }
}

function mapPersonItemToResult(item: PersonItem): PersonResult {
  const mention = item.nickname || item.name;

  return {
    resultType: ResultType.PersonResult,
    resultId: 'people-' + item.account_id,
    name: item.name,
    href: '/people/' + item.account_id,
    avatarUrl: item.picture,
    contentType: ContentType.Person,
    analyticsType: AnalyticsType.ResultPerson,
    mentionName: mention,
    presenceMessage: item.job_title || '',
  };
}

function mapUrsResultItemToResult(item: UrsPersonItem): PersonResult {
  return {
    resultType: ResultType.PersonResult,
    resultId: 'people-' + item.id,
    name: item.name,
    href: '/people/' + item.id,
    avatarUrl: item.avatarUrl,
    contentType: ContentType.Person,
    analyticsType: AnalyticsType.ResultPerson,
    mentionName: item.nickname || '',
    presenceMessage: '',
  };
}

function mapItemToResult(scope: Scope, item: SearchItem): Result {
  if (scope.startsWith('confluence')) {
    return mapConfluenceItemToResult(scope, item as ConfluenceItem);
  }
  if (scope.startsWith('jira')) {
    return mapJiraItemToResult(item as JiraItem);
  }

  if (scope === Scope.People) {
    return mapPersonItemToResult(item as PersonItem);
  }

  if (scope === Scope.UserConfluence || scope === Scope.UserJira) {
    return mapUrsResultItemToResult(item as UrsPersonItem);
  }

  throw new Error(`Non-exhaustive match for scope: ${scope}`);
}
