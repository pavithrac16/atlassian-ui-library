// @flow

import React from 'react';
import InlineMessage from '../src';

const MessageContent = (
  <div>
    <h4>Authenticate heading</h4>
    <span>
      Authenticate <a href="#">here</a> to see more information
    </span>
  </div>
);

export default () => (
  <div>
    <InlineMessage
      type="confirmation"
      title="JIRA Service Desk"
      secondaryText="Authenticate to see more information"
    >
      {MessageContent}
    </InlineMessage>
    <InlineMessage
      type="confirmation"
      secondaryText="Authenticate to see more information"
    >
      {MessageContent}
    </InlineMessage>
  </div>
);
