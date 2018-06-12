import RecentSearchClient, {
  RecentItem,
  splitIssueKeyAndName,
} from '../src/api/RecentSearchClient';
import 'whatwg-fetch';
import * as fetchMock from 'fetch-mock';
import {
  GlobalSearchResult,
  GlobalSearchJiraObjectResult,
  AnalyticsType,
  GlobalSearchResultTypes,
  ObjectType,
  GlobalSearchConfluenceObjectResult,
} from '../src/model/Result';

function apiWillReturn(state: RecentItem[]) {
  const response = Array.isArray(state) ? { data: state } : state;

  const opts = {
    name: 'recent',
  };

  fetchMock.get('localhost/api/client/recent?cloudId=123', response, opts);
}

describe('RecentSearchClient', () => {
  let searchClient: RecentSearchClient;

  beforeEach(() => {
    searchClient = new RecentSearchClient('localhost', '123');
  });

  afterEach(fetchMock.restore);

  describe('getRecentItems()', () => {
    it('should return result items', async () => {
      apiWillReturn([
        {
          objectId: 'objectId',
          name: 'HOT-83341 name',
          iconUrl: 'iconUrl',
          container: 'container',
          url: 'url',
          provider: 'jira',
        },
      ]);

      const items = await searchClient.getRecentItems();
      expect(items).toHaveLength(1);

      const item: GlobalSearchJiraObjectResult = items[0] as GlobalSearchJiraObjectResult;
      expect(item.resultId).toEqual('recent-objectId');
      expect(item.avatarUrl).toEqual('iconUrl');
      expect(item.name).toEqual('name');
      expect(item.href).toEqual('url');
      expect(item.containerName).toEqual('container');
      expect(item.objectKey).toEqual('HOT-83341');
      expect(item.analyticsType).toEqual(AnalyticsType.RecentJira);
      expect(item.globalSearchResultType).toEqual(
        GlobalSearchResultTypes.JiraObjectResult,
      );
      expect(item.objectType).toEqual(ObjectType.JiraIssue);
    });
  });

  describe('search()', () => {
    it('should return result items', async () => {
      apiWillReturn([
        {
          objectId: 'objectId',
          name: 'name',
          iconUrl: 'iconUrl',
          container: 'container',
          url: 'url',
          provider: 'confluence',
        },
      ]);

      const items = await searchClient.search('name');
      expect(items).toHaveLength(1);

      const item: GlobalSearchConfluenceObjectResult = items[0] as GlobalSearchConfluenceObjectResult;
      expect(item.resultId).toEqual('recent-objectId');
      expect(item.avatarUrl).toEqual('iconUrl');
      expect(item.name).toEqual('name');
      expect(item.href).toEqual('url');
      expect(item.containerName).toEqual('container');
      expect(item.analyticsType).toEqual(AnalyticsType.RecentConfluence);
      expect(item.globalSearchResultType).toEqual(
        GlobalSearchResultTypes.ConfluenceObjectResult,
      );
      expect(item.objectType).toEqual(ObjectType.ConfluenceAmbiguous);
    });

    it('should call the api only once when client is invoked repeatedly', async () => {
      apiWillReturn([]);

      await searchClient.search('once');
      await searchClient.search('twice');
      await searchClient.search('thrice');

      expect(fetchMock.calls('recent')).toHaveLength(1);
    });

    it('should return an empty array when query is empty', async () => {
      apiWillReturn([
        {
          objectId: 'objectId',
          name: 'name',
          iconUrl: 'iconUrl',
          container: 'container',
          url: 'url',
          provider: 'provider',
        },
      ]);

      const items = await searchClient.search('');
      expect(items).toHaveLength(0);
    });

    it('should filter by prefix search', async () => {
      apiWillReturn([
        {
          objectId: 'objectId',
          name: 'name',
          iconUrl: 'iconUrl',
          container: 'container',
          url: 'url',
          provider: 'provider',
        },
        {
          objectId: 'objectId2',
          name: 'name2',
          iconUrl: 'iconUrl2',
          container: 'container2',
          url: 'url2',
          provider: 'provider',
        },
      ]);

      const items = await searchClient.search('Nam');
      expect(items).toHaveLength(2);
      expect(items[0].name).toEqual('name');
      expect(items[1].name).toEqual('name2');
    });
  });

  describe('jira issue name and key split', () => {
    it('should extract the key at the beginning of the name', () => {
      const { name, objectKey } = splitIssueKeyAndName(
        'HOME-123 Fix Confluence',
      );
      expect(objectKey).toEqual('HOME-123');
      expect(name).toEqual('Fix Confluence');
    });

    it('should leave names without issues key alone', () => {
      const { name, objectKey } = splitIssueKeyAndName('Fix Jira');
      expect(objectKey).toEqual(undefined);
      expect(name).toEqual('Fix Jira');
    });

    it('should not match issues keys not at the beginning of the name', () => {
      const { name, objectKey } = splitIssueKeyAndName(
        'HOME-123 Duplicate of HOME-666',
      );
      expect(objectKey).toEqual('HOME-123');
      expect(name).toEqual('Duplicate of HOME-666');
    });

    it('should not split the name of confluence titles', async () => {
      apiWillReturn([
        {
          objectId: 'objectId',
          name: 'HOT-83341 PIR - Lets get to the bottom of this!',
          iconUrl: 'iconUrl',
          container: 'container',
          url: 'url',
          provider: 'confluence',
        },
      ]);

      const items = await searchClient.getRecentItems();
      expect(items).toHaveLength(1);

      const item: GlobalSearchConfluenceObjectResult = items[0] as GlobalSearchConfluenceObjectResult;
      expect(item.name).toEqual(
        'HOT-83341 PIR - Lets get to the bottom of this!',
      );
      expect(item).not.toHaveProperty('objectKey');
      expect(item.globalSearchResultType).toEqual(
        GlobalSearchResultTypes.ConfluenceObjectResult,
      );
      expect(item.objectType).toEqual(ObjectType.ConfluenceAmbiguous);
    });
  });
});
