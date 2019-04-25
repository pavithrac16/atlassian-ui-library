import * as React from 'react';
import { md, code, Props } from '@atlaskit/docs';

export default md`
  ## Usage

  ${code`
  import * as React from 'react';
  import algoliasearch from 'algoliasearch';
  import Button from '@atlaskit/button';
  import { HelpPanel } from '../src';
  import LocaleIntlProvider from '../example-helpers/LocaleIntlProvider';
  import { Article } from '../src/model/Article';

  var client = algoliasearch('xxxxxxx', 'xxxxxxxxxxxxxxxxxxx');
  var index = client.initIndex('xxxxxxxx');

  export default class extends React.Component {
    state = {
      isOpen: false,
      searchText: 'test',
    };

    openDrawer = () =>
      this.setState({
        isOpen: true,
      });

    closeDrawer = () =>
      this.setState({
        isOpen: false,
      });

    onGetArticle = async (articleId: string): Promise<Article> => {
      return new Promise((resolve, reject) => {
        index.getObjects([articleId], function(err, content) {
          if (err) {
            reject(err);
          }

          const article = content.results[0];
          resolve(article);
        });
      });
    };

    render() {
      const { isOpen } = this.state;
      return (
        <div style={{ padding: '2rem' }}>
          <LocaleIntlProvider locale={'en'}>
            <HelpPanel
              isOpen={isOpen}
              onBtnCloseClick={this.closeDrawer}
              articleId="xxxxxxxxxxxxxx"
              onGetArticle={this.onGetArticle}
            >
              <h1>Default content</h1>
            </HelpPanel>
          </LocaleIntlProvider>
          <Button type="button" onClick={this.openDrawer}>
            Open drawer
          </Button>

          <Button type="button" onClick={this.closeDrawer}>
            Close drawer
          </Button>
        </div>
      );
    }
  }

  
  `}

  ${<a href="/examples/help/help-panel/Help-Panel-mockup-api">Open Example</a>}

  ${(
    <Props
      props={require('!!extract-react-types-loader!../src/components/HelpPanel')}
    />
  )}
`;
