import * as React from 'react';
import { AnalyticsListener } from '@atlaskit/analytics-next';
import Page from '@atlaskit/page';

import LocaleIntlProvider from '../example-helpers/LocaleIntlProvider';
import { getArticle, searchArticle } from './utils/mockData';
import { ExampleWrapper, HelpWrapper } from './utils/styled';

import Help from '../src';

const handleEvent = (analyticsEvent: { payload: any; context: any }) => {
  const { payload, context } = analyticsEvent;
  console.log('Received event:', { payload, context });
};

export default class extends React.Component {
  state = {
    searchText: 'test',
  };

  onWasHelpfulSubmit = (value: string): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  };

  onSearchArticlesSubmit = (searchValue: any) => {
    this.setState({ searchText: searchValue });
  };

  onGetArticle = (articleId: string): Promise<any> => {
    return new Promise(resolve =>
      setTimeout(() => resolve(getArticle(articleId)), 100),
    );
  };

  onSearch = (value: string): Promise<any> => {
    return new Promise(resolve =>
      setTimeout(() => resolve(searchArticle(value)), 1000),
    );
  };

  render() {
    return (
      <ExampleWrapper>
        <Page>
          <HelpWrapper>
            <AnalyticsListener channel="atlaskit" onEvent={handleEvent}>
              <LocaleIntlProvider locale={'en'}>
                <Help
                  onWasHelpfulSubmit={this.onWasHelpfulSubmit}
                  articleId="00"
                  onGetArticle={this.onGetArticle}
                  onSearch={this.onSearch}
                >
                  <h1>Default content</h1>
                </Help>
              </LocaleIntlProvider>
            </AnalyticsListener>
          </HelpWrapper>
        </Page>
      </ExampleWrapper>
    );
  }
}
