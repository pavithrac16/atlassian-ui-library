import * as React from 'react';
import {
  ConfluenceQuickSearchContainer,
  Props,
} from '../ConfluenceQuickSearchContainer';
import { noResultsCrossProductSearchClient } from '../../../__tests__/unit/mocks/_mockCrossProductSearchClient';
import { noResultsPeopleSearchClient } from '../../../__tests__/unit/mocks/_mockPeopleSearchClient';
import {
  noResultsConfluenceClient,
  makeConfluenceClient,
  mockAutocompleteClient,
  mockNavAutocompleteClient,
} from '../../../__tests__/unit/mocks/_mockConfluenceClient';
import { shallowWithIntl } from '../../../__tests__/unit/helpers/_intl-enzyme-test-helper';
import {
  BaseConfluenceQuickSearchContainer as QuickSearchContainer,
  Props as QuickSearchContainerProps,
} from '../../common/QuickSearchContainer';
import {
  makeConfluenceObjectResult,
  makePersonResult,
} from '../../../__tests__/unit/_test-util';
import { Scope } from '../../../api/types';
import {
  Result,
  ConfluenceResultsMap,
  ResultsWithTiming,
  ContentType,
  ResultType,
  AnalyticsType,
} from '../../../model/Result';
import {
  EMPTY_CROSS_PRODUCT_SEARCH_RESPONSE,
  DEFAULT_AB_TEST,
  CrossProductSearchClient,
  SearchResultsMap,
  FilterType,
  SearchParams,
} from '../../../api/CrossProductSearchClient';
import * as SearchUtils from '../../SearchResultsUtil';

import { mockLogger } from '../../../__tests__/unit/mocks/_mockLogger';
import { ReferralContextIdentifiers } from '../../GlobalQuickSearchWrapper';
import { ConfluenceFeatures } from '../../../util/features';
import { shallow } from 'enzyme';

const sessionId = 'sessionId';
const referralContextIdentifiers: ReferralContextIdentifiers = {
  currentContainerId: '123-container',
  currentContentId: '123-content',
  searchReferrerId: '123-search-referrer',
};

const DEFAULT_FEATURES: ConfluenceFeatures = {
  abTest: DEFAULT_AB_TEST,
  isInFasterSearchExperiment: false,
  useUrsForBootstrapping: false,
  searchExtensionsEnabled: false,
  isAutocompleteEnabled: false,
  complexSearchExtensionsEnabled: false,
  isNavAutocompleteEnabled: false,
};

function render(partialProps?: Partial<Props>) {
  const logger = mockLogger();
  const props: Props = {
    confluenceClient: noResultsConfluenceClient,
    crossProductSearchClient: noResultsCrossProductSearchClient,
    peopleSearchClient: noResultsPeopleSearchClient,
    autocompleteClient: mockAutocompleteClient,
    navAutocompleteClient: mockNavAutocompleteClient,
    logger,
    referralContextIdentifiers,
    features: DEFAULT_FEATURES,
    createAnalyticsEvent: undefined,
    inputControls: undefined,
    onAdvancedSearch: undefined,
    linkComponent: undefined,
    modelContext: undefined,
    confluenceUrl: 'mockConfluenceUrl',
    ...partialProps,
  };

  // @ts-ignore - doesn't recognise injected intl prop
  return shallowWithIntl(<ConfluenceQuickSearchContainer {...props} />);
}

const mockCrossProductSearchClient = {
  search(searchParams: SearchParams) {
    return Promise.resolve(EMPTY_CROSS_PRODUCT_SEARCH_RESPONSE) as any;
  },
  getAbTestDataForProduct() {
    return Promise.resolve(DEFAULT_AB_TEST) as any;
  },
  getAbTestData(scope: Scope) {
    return Promise.resolve(DEFAULT_AB_TEST) as any;
  },
  getPeople() {
    return Promise.resolve(EMPTY_CROSS_PRODUCT_SEARCH_RESPONSE);
  },
} as CrossProductSearchClient;

const mockSingleResultPromise = (scope: Scope, result: Result) => {
  const results = {} as SearchResultsMap;
  results[scope] = {
    items: [result],
    totalSize: 1,
  };

  return Promise.resolve({
    results: results,
  });
};

describe('ConfluenceQuickSearchContainer', () => {
  it('should render QuickSearchContainer with correct props', () => {
    const wrapper = render();
    const quickSearchContainer = wrapper.find(QuickSearchContainer);

    const props = quickSearchContainer.props();
    expect(props).toHaveProperty('getSearchResultsComponent');
  });

  it('should return recent viewed items', async () => {
    const mockConfluenceClient = makeConfluenceClient({
      getRecentItems() {
        return Promise.resolve([makeConfluenceObjectResult()]);
      },
    });

    const wrapper = render({
      confluenceClient: mockConfluenceClient,
    });
    const quickSearchContainer = wrapper.find(QuickSearchContainer);
    const requiredRecents = await (quickSearchContainer.props() as QuickSearchContainerProps<
      ConfluenceResultsMap
    >).getRecentItems('session_id').eagerRecentItemsPromise;

    expect(requiredRecents).toMatchObject({
      results: {
        objects: {
          items: [
            {
              analyticsType: 'result-confluence',
              resultType: 'confluence-object-result',
              containerName: 'containerName',
              contentType: 'confluence-page',
              containerId: 'containerId',
              name: 'name',
              avatarUrl: 'avatarUrl',
              href: 'href',
              resultId: 'resultId',
              friendlyLastModified: 'friendly-last-modified',
            },
          ],
          totalSize: 1,
        },
        spaces: {
          items: [],
          totalSize: 0,
        },
        people: {
          items: [],
          totalSize: 0,
        },
      },
    } as ResultsWithTiming<ConfluenceResultsMap>);
  });

  it('should return recent items using the crossproduct search when prefetching is on ', async () => {
    const wrapper = render({
      features: { ...DEFAULT_FEATURES, useUrsForBootstrapping: true },
      crossProductSearchClient: {
        ...mockCrossProductSearchClient,
        getPeople() {
          return mockSingleResultPromise(
            Scope.UserConfluence,
            makePersonResult(),
          );
        },
      },
    });

    const quickSearchContainer = wrapper.find(QuickSearchContainer);
    const recentsPromise = (quickSearchContainer.props() as QuickSearchContainerProps<
      ConfluenceResultsMap
    >).getRecentItems('session_id');
    const requiredRecents = await recentsPromise.eagerRecentItemsPromise;
    const peopleRecents = await recentsPromise.lazyLoadedRecentItemsPromise;

    expect(requiredRecents).toEqual({
      results: {
        people: {
          items: [],
          totalSize: 0,
        },
        objects: {
          items: [],
          totalSize: 0,
        },
        spaces: {
          items: [],
          totalSize: 0,
        },
      },
    } as ResultsWithTiming<ConfluenceResultsMap>);

    expect(peopleRecents).toEqual({
      people: {
        items: [
          {
            mentionName: 'mentionName',
            presenceMessage: 'presenceMessage',
            analyticsType: 'result-person',
            resultType: 'person-result',
            contentType: 'person',
            name: 'name',
            avatarUrl: 'avatarUrl',
            href: 'href',
            resultId: expect.any(String),
          },
        ],
        totalSize: 1,
      },
    } as Partial<ConfluenceResultsMap>);
  });

  it('should return recent items using the crossproduct search when prefetching is off', async () => {
    const wrapper = render({
      features: { ...DEFAULT_FEATURES, useUrsForBootstrapping: false },
      peopleSearchClient: {
        getRecentPeople() {
          return Promise.resolve([makePersonResult()]);
        },
      },
      crossProductSearchClient: {
        search(params: SearchParams) {
          return Promise.resolve(EMPTY_CROSS_PRODUCT_SEARCH_RESPONSE);
        },
        getAbTestDataForProduct() {
          return Promise.resolve(DEFAULT_AB_TEST);
        },
        getAbTestData(scope: Scope) {
          return Promise.resolve(DEFAULT_AB_TEST);
        },
        getPeople() {
          return Promise.resolve(EMPTY_CROSS_PRODUCT_SEARCH_RESPONSE);
        },
      },
    });

    const quickSearchContainer = wrapper.find(QuickSearchContainer);
    const recentsPromise = (quickSearchContainer.props() as QuickSearchContainerProps<
      ConfluenceResultsMap
    >).getRecentItems('session_id');
    const requiredRecents = await recentsPromise.eagerRecentItemsPromise;
    const peopleRecents = await recentsPromise.lazyLoadedRecentItemsPromise;

    expect(requiredRecents).toEqual({
      results: {
        people: {
          items: [],
          totalSize: 0,
        },
        objects: {
          items: [],
          totalSize: 0,
        },
        spaces: {
          items: [],
          totalSize: 0,
        },
      },
    } as ResultsWithTiming<ConfluenceResultsMap>);

    expect(peopleRecents).toEqual({
      people: {
        items: [
          {
            mentionName: 'mentionName',
            presenceMessage: 'presenceMessage',
            analyticsType: 'result-person',
            resultType: 'person-result',
            contentType: 'person',
            name: 'name',
            avatarUrl: 'avatarUrl',
            href: 'href',
            resultId: expect.any(String),
          },
        ],
        totalSize: 1,
      },
    } as Partial<ConfluenceResultsMap>);
  });

  it('should call cross product search client with correct query version', async () => {
    const searchSpy = jest.spyOn(noResultsCrossProductSearchClient, 'search');
    const dummyQueryVersion = 123;
    const dummySpaceKey = 'abc123';

    const modelParams = [
      {
        '@type': 'queryParams',
        queryVersion: dummyQueryVersion,
      },
      {
        '@type': 'currentSpace',
        spaceKey: dummySpaceKey,
      },
    ];

    const wrapper = render({
      confluenceClient: noResultsConfluenceClient,
      crossProductSearchClient: noResultsCrossProductSearchClient,
      modelContext: {
        spaceKey: dummySpaceKey,
      },
    });

    const quickSearchContainer = wrapper.find(QuickSearchContainer);
    (quickSearchContainer.props() as QuickSearchContainerProps<
      ConfluenceResultsMap
    >).getSearchResults('query', sessionId, 100, dummyQueryVersion, []);

    expect(searchSpy).toHaveBeenCalledWith({
      query: 'query',
      sessionId: sessionId,
      referrerId: '123-search-referrer',
      scopes: expect.any(Array),
      filters: [],
      modelParams,
      resultLimit: undefined,
    });

    searchSpy.mockRestore();
  });

  it('should return search result', async () => {
    const wrapper = render({
      crossProductSearchClient: {
        ...mockCrossProductSearchClient,
        search({ scopes }: SearchParams) {
          // only return items when People scope is set
          if (scopes.find(s => s === Scope.People)) {
            return mockSingleResultPromise(Scope.People, makePersonResult());
          }

          return Promise.resolve(EMPTY_CROSS_PRODUCT_SEARCH_RESPONSE);
        },
        getPeople() {
          return mockSingleResultPromise(
            Scope.UserConfluence,
            makePersonResult(),
          );
        },
      },
    });

    const quickSearchContainer = wrapper.find(QuickSearchContainer);
    const searchResults = await (quickSearchContainer.props() as QuickSearchContainerProps<
      ConfluenceResultsMap
    >).getSearchResults('query', sessionId, 100, 0, []);

    expect(searchResults).toEqual({
      results: {
        people: {
          items: [
            {
              mentionName: 'mentionName',
              presenceMessage: 'presenceMessage',
              analyticsType: 'result-person',
              resultType: 'person-result',
              contentType: 'person',
              name: 'name',
              avatarUrl: 'avatarUrl',
              href: 'href',
              resultId: expect.any(String),
            },
          ],
          totalSize: 1,
        },
        objects: {
          items: [],
          totalSize: 0,
        },
        spaces: {
          items: [],
          totalSize: 0,
        },
      },
      timings: {
        confSearchElapsedMs: expect.any(Number),
      },
    } as ResultsWithTiming<ConfluenceResultsMap>);
  });

  describe('getFilterComponent', () => {
    const dummySpaceKey = 'abc123';
    const mockSearchSessionId = 'someSearchSessionId';
    const onAdvancedSearch = jest.fn();

    const wrapper = render({
      features: { ...DEFAULT_FEATURES, complexSearchExtensionsEnabled: true },
      confluenceClient: noResultsConfluenceClient,
      crossProductSearchClient: noResultsCrossProductSearchClient,
      modelContext: {
        spaceKey: dummySpaceKey,
      },
      confluenceUrl: 'mockConfluenceUrl',
      referralContextIdentifiers: {
        currentContainerName: 'Dummy space',
        currentContentId: '123',
        currentContainerIcon: 'test.png',
        currentContainerId: '123',
        searchReferrerId: '123',
      },
      onAdvancedSearch,
    });

    const results: ConfluenceResultsMap = {
      objects: {
        items: [
          {
            analyticsType: AnalyticsType.ResultConfluence,
            resultType: ResultType.ConfluenceObjectResult,
            containerName: 'containerName',
            contentType: ContentType.ConfluencePage,
            containerId: 'containerId',
            name: 'name',
            avatarUrl: 'avatarUrl',
            href: 'href',
            resultId: 'resultId',
            friendlyLastModified: 'friendlyLastModified',
          },
        ],
        totalSize: 1,
      },
      spaces: {
        items: [],
        totalSize: 0,
      },
      people: {
        items: [],
        totalSize: 0,
      },
    };

    const baseFilterComponentProps = {
      isLoading: false,
      currentFilters: [],
      onFilterChanged: jest.fn(),
      searchResults: results,
    };

    it('Renders filter component', () => {
      const filterComponent = (wrapper.instance() as ConfluenceQuickSearchContainer).getFilterComponent(
        {
          ...baseFilterComponentProps,
          latestSearchQuery: 'a',
          searchSessionId: mockSearchSessionId,
        },
      );

      expect(filterComponent).toBeDefined();
      expect(filterComponent).not.toBeNull();

      if (filterComponent) {
        expect(filterComponent.props.isDisabled).toBeFalsy();
        expect(filterComponent.props.spaceKey).toEqual(dummySpaceKey);
      }
    });

    it('onAdvancedSearch is passed correct params', () => {
      const filterComponent = (wrapper.instance() as ConfluenceQuickSearchContainer).getFilterComponent(
        {
          ...baseFilterComponentProps,
          latestSearchQuery: 'a',
          currentFilters: [
            { '@type': FilterType.Spaces, spaceKeys: [dummySpaceKey] },
          ],
          searchSessionId: mockSearchSessionId,
        },
      );

      expect(filterComponent).not.toBeNull();

      if (filterComponent) {
        const filterWrapper = shallow(filterComponent);
        filterWrapper.props().wrappedComponentProps.onAdvancedSearch();

        expect(onAdvancedSearch).toHaveBeenCalledWith(
          undefined,
          'content',
          'a',
          'someSearchSessionId',
          [dummySpaceKey],
        );
      }
    });

    it('Filter component is disabled when results are loading', () => {
      const filterComponent = (wrapper.instance() as ConfluenceQuickSearchContainer).getFilterComponent(
        {
          ...baseFilterComponentProps,
          isLoading: true,
          latestSearchQuery: 'a',
          searchSessionId: mockSearchSessionId,
        },
      );

      expect(filterComponent).toBeDefined();
      expect(filterComponent).not.toBeNull();

      if (filterComponent) {
        expect(filterComponent.props.isDisabled).toBeTruthy();
        expect(filterComponent.props.spaceKey).toEqual(dummySpaceKey);
      }
    });

    it("Doesn't render filter component on pre-query", () => {
      const filterComponent = (wrapper.instance() as ConfluenceQuickSearchContainer).getFilterComponent(
        {
          ...baseFilterComponentProps,
          latestSearchQuery: '',
          searchSessionId: mockSearchSessionId,
        },
      );

      expect(filterComponent).toBeUndefined();
    });

    it("Doesn't render filter component if there are no search results", () => {
      const filterComponent = (wrapper.instance() as ConfluenceQuickSearchContainer).getFilterComponent(
        {
          ...baseFilterComponentProps,
          latestSearchQuery: 'a',
          searchSessionId: mockSearchSessionId,
          searchResults: {
            ...results,
            objects: {
              items: [],
              totalSize: 0,
            },
          },
        },
      );

      expect(filterComponent).toBeUndefined();
    });
  });

  describe('Advanced Search callback', () => {
    let redirectSpy: jest.SpyInstance<(query?: string) => void>;
    let originalWindowLocation = window.location;

    beforeEach(() => {
      delete window.location;
      window.location = Object.assign({}, window.location, {
        assign: jest.fn(),
      });
      redirectSpy = jest.spyOn(
        SearchUtils,
        'redirectToConfluenceAdvancedSearch',
      );
    });

    afterEach(() => {
      redirectSpy.mockReset();
      redirectSpy.mockRestore();
      window.location = originalWindowLocation;
    });

    const mountComponent = (spy: jest.Mock<{}>) => {
      const wrapper = render({
        onAdvancedSearch: spy,
      });
      const quickSearchContainer = wrapper.find(QuickSearchContainer);

      const props = quickSearchContainer.props();
      expect(props).toHaveProperty('handleSearchSubmit');

      return (props as any)['handleSearchSubmit'];
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
        'content',
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

  describe('Autocomplete', () => {
    it('should not pass down getAutocomplete if isAutocompleteEnabled is false', () => {
      const wrapper = render();
      const quickSearchContainer = wrapper.find(QuickSearchContainer);

      const props = quickSearchContainer.props();
      expect(props.getAutocompleteSuggestions).toBeUndefined();
    });

    it('should pass down getAutocomplete if isAutocompleteEnabled', () => {
      const wrapper = render({
        features: { ...DEFAULT_FEATURES, isAutocompleteEnabled: true },
      });
      const quickSearchContainer = wrapper.find(QuickSearchContainer);
      const props = quickSearchContainer.props();
      expect(props.getAutocompleteSuggestions).not.toBeUndefined();
    });
  });
});
