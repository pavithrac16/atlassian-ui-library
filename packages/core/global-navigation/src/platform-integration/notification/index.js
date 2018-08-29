// @flow
import React from 'react';

import NotificationBadge from './components/NotificationBadge';
import NotificationDrawerContents from './components/NotificationDrawerContents';
// import type { NotificationIntegration } from './types';

const notificationIntegration = (
  fabricNotificationLogUrl?: string,
  cloudId?: string,
) => ({
  badge: () => (
    <NotificationBadge
      fabricNotificationLogUrl={fabricNotificationLogUrl}
      cloudId={cloudId}
    />
  ),
  notificationDrawerContents: () => (
    <NotificationDrawerContents
      cloudId={cloudId}
      fabricNotificationLogUrl={fabricNotificationLogUrl}
    />
  ),
  onNotificationDrawerOpen: () => {
    console.log('clear notification badge count here');
  },
  onNotificationDrawerClose: () => {
    console.log('optional call back to do stuff when the iFrame clsoes');
  },
});

export default notificationIntegration;
