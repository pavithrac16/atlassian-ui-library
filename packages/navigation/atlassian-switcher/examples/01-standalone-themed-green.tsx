import * as React from 'react';
import { mockEndpoints, REQUEST_FAST } from './helpers/mock-endpoints';
import { withAnalyticsLogger, withIntlProvider } from './helpers';
import AtlassianSwitcher from '../src';
import styled from 'styled-components';
import { Grid, GridColumn } from '@atlaskit/page';
import ColorScheme from './helpers/ColorScheme';

const Container = styled.div`
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0 8px;
  display: inline-block;
  margin: 5px;
  vertical-align: top;
`;
class InlineDialogSwitcherExample extends React.Component {
  state = {
    isLoaded: false,
  };

  componentDidMount() {
    this.loadData();
  }
  loadData = () => {
    mockEndpoints(
      'jira',
      originalMockData => {
        return {
          ...originalMockData,
          RECENT_CONTAINERS_DATA: {
            data: [],
          },
          CUSTOM_LINKS_DATA: {
            data: [],
          },
          XFLOW_SETTINGS: {},

          LICENSE_INFORMATION_DATA: {
            hostname: 'https://some-random-instance.atlassian.net',
            firstActivationDate: 1492488658539,
            maintenanceEndDate: '2017-04-24',
            maintenanceStartDate: '2017-04-17',
            products: {
              'jira-software.ondemand': {
                billingPeriod: 'ANNUAL',
                state: 'ACTIVE',
              },
            },
          },
        };
      },
      REQUEST_FAST,
    );
    this.setState({
      isLoaded: true,
    });
  };

  onTriggerXFlow = (productKey: string, sourceComponent: string) => {
    console.log(
      `Triggering xflow for => ${productKey} from ${sourceComponent}`,
    );
  };

  render() {
    const greenishColorScheme = {
      primaryTextColor: '#006400',
      secondaryTextColor: '#4ca64c',
      primaryHoverBackgroundColor: '#cce5cc',
      secondaryHoverBackgroundColor: '#e5f2e5',
    };

    return (
      this.state.isLoaded && (
        <Grid layout="fixed">
          <GridColumn medium={8}>
            {this.state.isLoaded && (
              <Container>
                <AtlassianSwitcher
                  product="trello"
                  disableCustomLinks
                  disableRecentContainers
                  disableHeadings
                  isDiscoverMoreForEveryoneEnabled
                  enableUserCentricProducts
                  cloudId="some-cloud-id"
                  triggerXFlow={this.onTriggerXFlow}
                  appearance="standalone"
                  theme={greenishColorScheme}
                />
              </Container>
            )}
          </GridColumn>
          <GridColumn medium={4}>
            <ColorScheme colorScheme={greenishColorScheme} />
          </GridColumn>
        </Grid>
      )
    );
  }
}

export default withIntlProvider(
  withAnalyticsLogger(InlineDialogSwitcherExample),
);
