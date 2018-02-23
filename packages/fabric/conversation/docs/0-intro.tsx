import * as React from 'react';
import { md, Props, Example } from '@atlaskit/docs';

const newConversationSource = `import { Conversation, ConversationResource } from '@atlaskit/conversation';

const provider = new ConversationResource({
  url: 'https://conversation-service/',
  user: {...}
});

<Conversation containerId="ari:cloud:platform::conversation/demo" provider={provider} />
`;

const existingConversationSource = `import { Conversation, ConversationResource } from '@atlaskit/conversation';

const provider = new ConversationResource({
  url: 'https://conversation-service/',
  user: {...}
});

const conversations = await provider.getConversations();
conversations.forEach(({ conversationId}) => {
  return <Conversation id={conversationId} containerId="ari:cloud:platform::conversation/demo" provider={provider} />;
});
`;

const props = {
  kind: 'program',
  classes: [
    {
      kind: 'generic',
      name: {
        kind: 'id',
        name: 'Conversation',
        type: null,
      },
      value: {
        kind: 'object',
        members: [
          {
            key: {
              kind: 'id',
              name: 'containerId',
            },
            kind: 'property',
            optional: false,
            value: {
              kind: 'generic',
              value: {
                kind: 'string',
              },
            },
            leadingComments: [
              {
                type: 'commentBlock',
                value:
                  'The container for the conversation. For example, a pull-request, Confluence page, Jira ticket, or blog post.',
              },
            ],
          },
          {
            key: {
              kind: 'id',
              name: 'provider',
            },
            kind: 'property',
            optional: false,
            value: {
              kind: 'generic',
              value: {
                kind: 'class',
                name: 'ResourceProvider',
              },
            },
            leadingComments: [
              {
                type: 'commentBlock',
                value: `The provider is an abstraction of the data-layer so that the components don't need to handle that. It comes with an internal store that drives the UI. In most cases you'll want to import the default provider, but you also have the option to override it with your own custom implementation.`,
              },
            ],
          },
          {
            key: {
              kind: 'id',
              name: 'id',
            },
            kind: 'property',
            optional: true,
            value: {
              kind: 'generic',
              value: {
                kind: 'string',
              },
            },
            leadingComments: [
              {
                type: 'commentBlock',
                value:
                  'The ID of the conversation. If not provided, a new converation will be created with the first comment.',
              },
            ],
          },
          {
            key: {
              kind: 'id',
              name: 'isExpanded',
            },
            kind: 'property',
            optional: true,
            value: {
              kind: 'generic',
              value: {
                kind: 'boolean',
              },
            },
            leadingComments: [
              {
                type: 'commentBlock',
                value:
                  'When set to true the conversation will render with the editor expanded.',
              },
            ],
          },
          {
            key: {
              kind: 'id',
              name: 'dataProviders',
            },
            kind: 'property',
            optional: true,
            value: {
              kind: 'generic',
              value: {
                kind: 'class',
                name: 'ProviderFactory',
              },
            },
            leadingComments: [
              {
                type: 'commentBlock',
                value:
                  'Optionally pass in a ProviderFactory to enable features like emojis and mentions.',
              },
            ],
          },
          {
            key: {
              kind: 'id',
              name: 'meta',
            },
            kind: 'property',
            optional: true,
            value: {
              kind: 'object',
              members: [
                {
                  key: {
                    kind: 'id',
                    name: '[key: string]',
                  },
                  kind: 'property',
                  optional: true,
                  value: {
                    kind: 'any',
                  },
                },
              ],
            },
            leadingComments: [
              {
                type: 'commentBlock',
                value:
                  'Optional meta data that will be stored with the conversation. This is useful if you want to associate the conversation with a particular line-number, paragraph, etc.',
              },
            ],
          },
          {
            key: {
              kind: 'id',
              name: 'onCancel',
            },
            kind: 'property',
            optional: true,
            value: {
              kind: 'generic',
              value: {
                kind: 'function',
                returnType: {
                  kind: 'void',
                },
              },
            },
            leadingComments: [
              {
                type: 'commentBlock',
                value:
                  'Will be called when the cancel-button in the editor is pressed.',
              },
            ],
          },
        ],
      },
    },
  ],
};

export default md`
  The Conversation component is a drop-in component for adding conversations in any context. It is the front-end part of the \`Conversation Service\` and together they make up \`Conversations as a Service\`.

  ## What is a Conversation?

  A conversation is a _group of comments_. The \`Conversation Service\` lets you associate any number of comments with a container (eg. pull-request, Confluence page, etc.), but in order for them to be meaningful they need to be grouped by conversations.

  A conversation can also contain any kind of meta-data, which can be used to render the conversation in the right place on a page (eg. inline comments).

  ## Usage

  The conversation component is a mini-app which comes with an internal store. It's completely driven by a provider (\`ConversationResource\`).

  Using the component is fairly straight forward. Just import \`Conversation\` and \`ConversationResource\` from \`@atlaskit/conversation\`. You can then use the component like below.

  ${(
    <Example
      Component={require('../examples/0-New-Conversation').default}
      title="New Conversation Example"
      source={newConversationSource}
    />
  )}

  Omitting the \`id\`-prop means that a new conversation will be created. Of course, in most cases you'll want to render existing conversations on a page as well. The provider let's you fetch all conversations for a container by calling \`.getConversations()\`.
  
  ${(
    <Example
      Component={require('../examples/1-Existing-Conversation').default}
      title="Existing Conversation Example"
      source={existingConversationSource}
    />
  )}

  ${<Props props={props} />}

`;
