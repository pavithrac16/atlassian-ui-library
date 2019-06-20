import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { ABTest, DEFAULT_AB_TEST } from '../../../api/CrossProductSearchClient';
import { CreateAnalyticsEventFn } from '../../../components/analytics/types';
import {
  PartiallyLoadedRecentItems,
  Props,
  QuickSearchContainer,
  SearchResultProps,
} from '../../../components/common/QuickSearchContainer';
import { GlobalQuickSearch } from '../../../components/GlobalQuickSearch';
import { GenericResultMap } from '../../../model/Result';
import * as AnalyticsHelper from '../../../util/analytics-event-helper';
import {
  PerformanceTiming,
  ShownAnalyticsAttributes,
} from '../../../util/analytics-util';
import { ReferralContextIdentifiers } from '../../../components/GlobalQuickSearchWrapper';
import { QuickSearchContext } from '../../../api/types';
import { mockLogger } from '../mocks/_mockLogger';

const defaultReferralContext = {
  searchReferrerId: 'referrerId',
  currentContentId: 'currentContentId',
  currentContainerId: 'currentContainerId',
};

const mapToResultGroup = (resultMap: GenericResultMap) =>
  Object.keys(resultMap).map(key => ({
    key,
    title: `title_${key}` as any,
    items: resultMap[key],
  }));

const mockEvent: any = {
  context: [],
  update: jest.fn(() => mockEvent),
  fire: jest.fn(() => mockEvent),
};

const defaultProps = {
  product: 'confluence' as QuickSearchContext,
  logger: mockLogger(),
  getSearchResultsComponent: jest.fn(
    (props: SearchResultProps<GenericResultMap>) => null,
  ),
  getRecentItems: jest.fn((searchSessionId: string) => ({
    eagerRecentItemsPromise: Promise.resolve({ results: {} }),
    lazyLoadedRecentItemsPromise: Promise.resolve({}),
  })),
  getSearchResults: jest.fn(
    (query: string, sessionId: string, startTime: number) =>
      Promise.resolve({ results: {} }),
  ),
  createAnalyticsEvent: jest.fn(() => mockEvent),
  handleSearchSubmit: jest.fn(),
  referralContextIdentifiers: defaultReferralContext,
  getPreQueryDisplayedResults: jest.fn(mapToResultGroup),
  getPostQueryDisplayedResults: jest.fn(mapToResultGroup),
  features: {
    abTest: DEFAULT_AB_TEST,
    searchExtensionsEnabled: false,
  },
};

const mountQuickSearchContainer = (
  partialProps?: Partial<Props<GenericResultMap>>,
) => {
  const props = {
    ...defaultProps,
    ...partialProps,
  };
  return mount(<QuickSearchContainer {...props} />);
};

const mountQuickSearchContainerWaitingForRender = async (
  partialProps?: Partial<Props<GenericResultMap>>,
) => {
  const wrapper = mountQuickSearchContainer(partialProps);
  await wrapper.instance().componentDidMount!();
  wrapper.update();
  return wrapper;
};

const assertLastCall = (spy: jest.Mock<{}>, obj: {} | any[]) => {
  expect(spy).toHaveBeenCalled();
  const getSearchResultComponentLastCall =
    spy.mock.calls[spy.mock.calls.length - 1];
  expect(getSearchResultComponentLastCall[0]).toMatchObject(obj);
};

describe('QuickSearchContainer', () => {
  let firePreQueryShownEventSpy: jest.SpyInstance<
    (
      eventAttributes: ShownAnalyticsAttributes,
      elapsedMs: number,
      renderTimeMs: number,
      searchSessionId: string,
      createAnalyticsEvent: CreateAnalyticsEventFn,
      abTest: ABTest,
      referralContextIdentifiers?: ReferralContextIdentifiers,
      retrievedFromAggregator?: boolean | undefined,
    ) => void
  >;
  let firePostQueryShownEventSpy: jest.SpyInstance<
    (
      resultsDetails: ShownAnalyticsAttributes,
      timings: PerformanceTiming,
      searchSessionId: string,
      query: string,
      createAnalyticsEvent: CreateAnalyticsEventFn,
      abTest: ABTest,
      referralContextIdentifiers?: ReferralContextIdentifiers,
    ) => void
  >;
  let fireExperimentExposureEventSpy: jest.SpyInstance<
    (
      abTest: ABTest,
      searchSessionId: string,
      createAnalyticsEvent: CreateAnalyticsEventFn,
    ) => void
  >;

  const assertPreQueryAnalytics = (
    recentItems: Record<any, any>,
    abTest: ABTest,
  ) => {
    expect(firePreQueryShownEventSpy).toBeCalled();
    expect(defaultProps.getPreQueryDisplayedResults).toBeCalled();
    expect(defaultProps.getPostQueryDisplayedResults).not.toBeCalled();

    const lastCall =
      firePreQueryShownEventSpy.mock.calls[
        firePreQueryShownEventSpy.mock.calls.length - 1
      ];
    expect(lastCall).toMatchObject([
      expect.objectContaining({
        resultCount: Object.keys(recentItems)
          .map(key => recentItems[key])
          .reduce((acc, arr) => acc + arr.length, 0),
        resultSectionCount: Object.keys(recentItems).length,
      }),
      expect.any(Number),
      expect.any(Number),
      expect.any(String),
      defaultProps.createAnalyticsEvent,
      abTest,
      defaultReferralContext,
      expect.any(Boolean),
    ]);
  };

  const assertPostQueryAnalytics = (
    query: string,
    searchResults: {
      [x: string]: any;
      spaces?: { key: string }[] | { key: string }[];
    },
  ) => {
    expect(firePostQueryShownEventSpy).toBeCalled();
    expect(defaultProps.getPostQueryDisplayedResults).toBeCalled();

    const lastCall =
      firePostQueryShownEventSpy.mock.calls[
        firePostQueryShownEventSpy.mock.calls.length - 1
      ];
    expect(lastCall).toMatchObject([
      expect.objectContaining({
        resultCount: Object.keys(searchResults)
          .map(key => searchResults[key])
          .reduce((acc, arr) => acc + arr.length, 0),
        resultSectionCount: Object.keys(searchResults).length,
      }),
      expect.objectContaining({
        startTime: expect.any(Number),
        elapsedMs: expect.any(Number),
      }),
      expect.any(String),
      query,
      defaultProps.createAnalyticsEvent,
      DEFAULT_AB_TEST,
      defaultReferralContext,
    ]);
  };

  const assertExposureEventAnalytics = (abTest: ABTest) => {
    expect(fireExperimentExposureEventSpy).toBeCalledWith(
      abTest,
      expect.any(String),
      defaultProps.createAnalyticsEvent,
    );
  };

  beforeEach(() => {
    firePreQueryShownEventSpy = jest.spyOn(
      AnalyticsHelper,
      'firePreQueryShownEvent',
    );
    firePostQueryShownEventSpy = jest.spyOn(
      AnalyticsHelper,
      'firePostQueryShownEvent',
    );
    fireExperimentExposureEventSpy = jest.spyOn(
      AnalyticsHelper,
      'fireExperimentExposureEvent',
    );
  });

  afterEach(() => {
    // reset mocks of default props
    jest.clearAllMocks();
  });

  it('should render GlobalQuickSearch with loading before recent items is retrieved', async () => {
    const wrapper = mountQuickSearchContainer();

    const globalQuickSearch = wrapper.find(GlobalQuickSearch);
    expect(globalQuickSearch.length).toBe(1);
    expect(globalQuickSearch.props().isLoading).toBe(true);
  });

  it('should add searchSessionId to handleSearchSubmit', async () => {
    const wrapper = await mountQuickSearchContainerWaitingForRender();
    wrapper.find('input').simulate('keydown', { key: 'Enter' });
    wrapper.update();

    const { searchSessionId } = wrapper.find(QuickSearchContainer).state();
    expect(searchSessionId).not.toBeNull();

    expect(defaultProps.handleSearchSubmit).toHaveBeenCalledWith(
      expect.anything(),
      searchSessionId,
    );
  });

  describe('Recent Items', () => {
    const recentItems = {
      recentPages: [
        {
          id: 'page-1',
        },
      ],
    };

    const lazyLoadedRecentItems = {
      recentPeople: [
        {
          id: 'person-1',
        },
      ],
    };

    const expectedRecentItems = {
      ...recentItems,
      ...lazyLoadedRecentItems,
    };

    it('should render recent items after mount', async () => {
      const getRecentItems = jest.fn<
        PartiallyLoadedRecentItems<GenericResultMap>
      >(() => ({
        eagerRecentItemsPromise: Promise.resolve({ results: recentItems }),
        lazyLoadedRecentItemsPromise: Promise.resolve(lazyLoadedRecentItems),
      }));

      const wrapper = await mountQuickSearchContainerWaitingForRender({
        getRecentItems,
      });

      // after update
      const globalQuickSearch = wrapper.find(GlobalQuickSearch);
      expect(globalQuickSearch.props().isLoading).toBe(false);
      expect(getRecentItems).toHaveBeenCalled();
      assertLastCall(defaultProps.getSearchResultsComponent, {
        recentItems: expectedRecentItems,
        isLoading: false,
        isError: false,
      });

      assertPreQueryAnalytics(expectedRecentItems, DEFAULT_AB_TEST);
      assertExposureEventAnalytics(DEFAULT_AB_TEST);
    });

    it('should render eager recent items before lazy one', async () => {
      let eagerResolveFn = () => {};
      let lazyResolveFn = () => {};

      const eagerRecentItemsPromise = new Promise(resolve => {
        eagerResolveFn = () => resolve({ results: recentItems });
      });
      const lazyLoadedRecentItemsPromise = new Promise(resolve => {
        lazyResolveFn = () => resolve(lazyLoadedRecentItems);
      });

      const getRecentItems = jest.fn<
        PartiallyLoadedRecentItems<GenericResultMap>
      >(() => ({
        eagerRecentItemsPromise,
        lazyLoadedRecentItemsPromise,
      }));

      await eagerResolveFn();

      await mountQuickSearchContainerWaitingForRender({
        getRecentItems,
      });

      assertLastCall(defaultProps.getSearchResultsComponent, {
        recentItems,
        isLoading: false,
        isError: false,
      });

      await lazyResolveFn();

      assertLastCall(defaultProps.getSearchResultsComponent, {
        recentItems: expectedRecentItems,
        isLoading: false,
        isError: false,
      });
    });
  });

  describe('Search', () => {
    let getSearchResults: jest.Mock<{}>;

    const renderAndWait = async (getRecentItems?: undefined) => {
      const wrapper = await mountQuickSearchContainerWaitingForRender({
        getSearchResults,
        ...(getRecentItems ? { getRecentItems } : {}),
      });
      return wrapper;
    };

    const search = async (
      wrapper:
        | ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>
        | ReactWrapper<{}, {}, React.Component<{}, {}, any>>,
      query: string,
      resultPromise:
        | Promise<{ results: { spaces: { key: string }[] } }>
        | Promise<never>
        | Promise<{ results: { spaces: { key: string }[] } }>,
    ) => {
      getSearchResults.mockReturnValueOnce(resultPromise);
      let globalQuickSearch = wrapper.find(GlobalQuickSearch);
      await globalQuickSearch.props().onSearch(query, 0);

      globalQuickSearch = wrapper.find(GlobalQuickSearch);
      expect(globalQuickSearch.props().isLoading).toBe(false);

      expect(getSearchResults).toHaveBeenCalledTimes(1);
      expect(getSearchResults.mock.calls[0][0]).toBe(query);
      return wrapper;
    };

    beforeEach(() => {
      getSearchResults = jest.fn();
    });

    it('should handle search', async () => {
      const searchResults = {
        spaces: [
          {
            key: 'space-1',
          },
        ],
      };
      const query = 'query';
      const wrapper = await renderAndWait();
      await search(wrapper, query, Promise.resolve({ results: searchResults }));
      assertLastCall(defaultProps.getSearchResultsComponent, {
        searchResults,
        isLoading: false,
        isError: false,
      });
      assertPostQueryAnalytics(query, searchResults);
    });

    it('should handle error', async () => {
      const query = 'queryWithError';
      const wrapper = await renderAndWait();
      await search(
        wrapper,
        query,
        Promise.reject(new Error('something wrong')),
      );
      assertLastCall(defaultProps.getSearchResultsComponent, {
        isLoading: false,
        isError: true,
        latestSearchQuery: query,
      });
    });

    it('should clear error after new query', async () => {
      const query = 'queryWithError2';
      const wrapper = await renderAndWait();
      await search(
        wrapper,
        query,
        Promise.reject(new Error('something wrong')),
      );
      assertLastCall(defaultProps.getSearchResultsComponent, {
        isLoading: false,
        isError: true,
        latestSearchQuery: query,
      });

      const newQuery = 'newQuery';
      const searchResults = {
        spaces: [
          {
            key: 'space-2',
          },
        ],
      };
      getSearchResults.mockReset();
      await search(
        wrapper,
        newQuery,
        Promise.resolve({ results: searchResults }),
      );
      assertLastCall(defaultProps.getSearchResultsComponent, {
        isLoading: false,
        isError: false,
        latestSearchQuery: newQuery,
      });
      assertPostQueryAnalytics(newQuery, searchResults);
    });
  });
});
