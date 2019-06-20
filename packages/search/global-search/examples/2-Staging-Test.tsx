import * as React from 'react';
import { GlobalQuickSearch } from '../src/index';
import { Config } from '../src/api/configureSearchClients';
import withNavigation from '../example-helpers/withNavigation';

const message = (
  <p>
    To get search results from{' '}
    <a
      href="https://jdog.jira-dev.com"
      target="_blank"
      title="497ea592-beb4-43c3-9137-a6e5fa301088"
    >
      jdog
    </a>{' '}
    or{' '}
    <a
      href="https://pug.jira-dev.com/"
      target="_blank"
      title="DUMMY-a5a01d21-1cc3-4f29-9565-f2bb8cd969f5"
    >
      pug
    </a>{' '}
    please login to{' '}
    <a href="https://id.stg.internal.atlassian.com" target="_blank">
      Staging Identity
    </a>
  </p>
);
const GlobalQuickSearchInNavigation = withNavigation(GlobalQuickSearch, {
  hideLocale: true,
  message,
  cloudIds: {
    jira: '497ea592-beb4-43c3-9137-a6e5fa301088', // jdog
    confluence: 'DUMMY-a5a01d21-1cc3-4f29-9565-f2bb8cd969f5', // pug
  },
});
const config: Partial<Config> = {
  activityServiceUrl: 'https://api-private.stg.atlassian.com/activity',
  searchAggregatorServiceUrl:
    'https://api-private.stg.atlassian.com/xpsearch-aggregator',
  directoryServiceUrl: 'https://api-private.stg.atlassian.com/directory',
};

export default class extends React.Component<{}, { cloudId: string }> {
  render() {
    return (
      <GlobalQuickSearchInNavigation
        {...config}
        enablePreQueryFromAggregator={true}
      />
    );
  }
}
