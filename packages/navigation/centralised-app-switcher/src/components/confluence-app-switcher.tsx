import React from 'react';
import { AppSwitcherWrapper, Item, Section, ManageButton } from '../primitives';
import { CustomLinksProvider } from '../providers/confluence-data-providers';

export default () => {
  return (
    <CustomLinksProvider>
      {({ isLoading: isLoadingCustomLinks, data: customLinksData }) => (
        <AppSwitcherWrapper>
          <Section title="First Section">
            <Item>First Item</Item>
            <Item>Second Item</Item>
          </Section>
          {isLoadingCustomLinks ? (
            'Loading Custom Links...'
          ) : (
            <Section title="Custom Links">
              {customLinksData[0].map(({ label }) => (
                <Item>{label}</Item>
              ))}
            </Section>
          )}
          <ManageButton
            onClick={() => (window.location.href = customLinksData[1])}
          />
        </AppSwitcherWrapper>
      )}
    </CustomLinksProvider>
  );
};
