import * as React from 'react';
import { Messages } from 'react-intl';
import Switcher from './switcher';
import CommonDataProvider from '../providers/common-data-provider';
import { Product, FeatureFlagProps } from '../types';
import { mapResultsToSwitcherProps } from '../utils/map-results-to-switcher-props';

type GenericSwitcherProps = {
  cloudId: string;
  messages: Messages;
  features: FeatureFlagProps;
  triggerXFlow: (productKey: string, sourceComponent: string) => void;
  product: Exclude<Product, Product.JIRA | Product.CONFLUENCE>;
};

const getFeatures = (
  product: Exclude<Product, Product.JIRA | Product.CONFLUENCE>,
) => {
  switch (product) {
    case Product.SITE_ADMIN:
      return {
        xflow: true,
      };
    case Product.HOME:
    case Product.PEOPLE:
    case Product.TRUSTED_ADMIN:
    default:
      return {
        xflow: false,
      };
  }
};

export default (props: GenericSwitcherProps) => (
  <CommonDataProvider cloudId={props.cloudId}>
    {providerResults => {
      const switcherLinks = mapResultsToSwitcherProps(
        props.cloudId,
        providerResults,
        {
          ...props.features,
          ...getFeatures(props.product),
        },
      );

      return <Switcher {...props} {...switcherLinks} />;
    }}
  </CommonDataProvider>
);
