import * as React from 'react';
import {
  AppSwitcherWrapper,
  AppSwitcherItem,
  Section,
  ManageButton,
  Skeleton,
} from '../primitives';
import { CustomLinksProvider } from '../providers/jira-data-providers';
import {
  RecentContainersProvider,
  LicenseInformationProvider,
} from '../providers/instance-data-providers';
import { WithCloudId, RecentContainer, CustomLink } from '../types';

export default ({ cloudId }: WithCloudId) => {
  return (
    <RecentContainersProvider cloudId={cloudId}>
      {({
        isLoading: isLoadingRecentContainers,
        data: recentContainersData,
      }) => (
        <CustomLinksProvider>
          {({ isLoading: isLoadingCustomLinks, data: customLinksData }) => (
            <LicenseInformationProvider cloudId={cloudId}>
              {({
                isLoading: isLoadingLicenseInformation,
                data: licenseInformationData,
              }) => (
                <AppSwitcherWrapper>
                  {isLoadingRecentContainers ? (
                    <Skeleton />
                  ) : (
                    <Section title="Recent Containers">
                      {recentContainersData &&
                        recentContainersData.data.map(
                          ({ objectId, name }: RecentContainer) => (
                            <AppSwitcherItem key={objectId}>
                              {name}
                            </AppSwitcherItem>
                          ),
                        )}
                    </Section>
                  )}
                  {isLoadingCustomLinks ? (
                    <Skeleton />
                  ) : (
                    <Section title="Custom Links">
                      {customLinksData &&
                        customLinksData[0].map(({ key, label }: CustomLink) => (
                          <AppSwitcherItem key={key}>{label}</AppSwitcherItem>
                        ))}
                    </Section>
                  )}
                  {isLoadingLicenseInformation ? (
                    <Skeleton />
                  ) : (
                    <Section title="License Information">
                      {licenseInformationData &&
                        Object.keys(licenseInformationData.products).map(
                          productKey => (
                            <AppSwitcherItem
                              key={productKey}
                            >{`${productKey} - ${
                              licenseInformationData.products[productKey].state
                            }`}</AppSwitcherItem>
                          ),
                        )}
                    </Section>
                  )}
                  {customLinksData && (
                    <ManageButton href={customLinksData[1]} />
                  )}
                </AppSwitcherWrapper>
              )}
            </LicenseInformationProvider>
          )}
        </CustomLinksProvider>
      )}
    </RecentContainersProvider>
  );
};
