import * as React from 'react';
import { Plugin, StateField, EditorState, PluginKey } from 'prosemirror-state';
import { emoji } from '@atlaskit/adf-schema';
import { ProviderFactory } from '@atlaskit/editor-common';
import {
  EmojiTypeAheadItem,
  EmojiProvider,
  EmojiDescription,
  SearchSort,
} from '@atlaskit/emoji';
import { EditorPlugin, Command } from '../../types';
import { Dispatch } from '../../event-dispatcher';
import { PortalProviderAPI } from '../../ui/PortalProvider';
import { ReactNodeView } from '../../nodeviews';
import { messages } from '../insert-block/ui/ToolbarInsertBlock';
import { inputRulePlugin as asciiInputRulePlugin } from './pm-plugins/ascii-input-rules';
import {
  addAnalytics,
  EVENT_TYPE,
  INPUT_METHOD,
  ACTION_SUBJECT,
  ACTION,
  ACTION_SUBJECT_ID,
} from '../analytics';
import { IconEmoji } from '../quick-insert/assets';
import emojiNodeView from './nodeviews/emoji';
import { typeAheadPluginKey, TypeAheadPluginState } from '../type-ahead';
import { analyticsService } from '../../analytics';
import { TypeAheadItem } from '../type-ahead/types';

export const defaultListLimit = 50;
const isFullShortName = (query?: string) =>
  query &&
  query.length > 1 &&
  query.charAt(0) === ':' &&
  query.charAt(query.length - 1) === ':';

const emojiPlugin: EditorPlugin = {
  nodes() {
    return [{ name: 'emoji', node: emoji }];
  },

  pmPlugins() {
    return [
      {
        name: 'emoji',
        plugin: ({ providerFactory, dispatch, portalProviderAPI }) =>
          emojiPluginFactory(dispatch, providerFactory, portalProviderAPI),
      },
      {
        name: 'emojiAsciiInputRule',
        plugin: ({ schema, providerFactory }) =>
          asciiInputRulePlugin(schema, providerFactory),
      },
    ];
  },

  pluginsOptions: {
    quickInsert: ({ formatMessage }) => [
      {
        title: formatMessage(messages.emoji),
        description: formatMessage(messages.emojiDescription),
        priority: 500,
        keyshortcut: ':',
        icon: () => <IconEmoji label={formatMessage(messages.emoji)} />,
        action(insert, state) {
          const mark = state.schema.mark('typeAheadQuery', {
            trigger: ':',
          });
          const emojiText = state.schema.text(':', [mark]);
          const tr = insert(emojiText);
          return addAnalytics(tr, {
            action: ACTION.INVOKED,
            actionSubject: ACTION_SUBJECT.TYPEAHEAD,
            actionSubjectId: ACTION_SUBJECT_ID.TYPEAHEAD_EMOJI,
            attributes: { inputMethod: INPUT_METHOD.QUICK_INSERT },
            eventType: EVENT_TYPE.UI,
          });
        },
      },
    ],
    typeAhead: {
      trigger: ':',
      // Custom regex must have a capture group around trigger
      // so it's possible to use it without needing to scan through all triggers again
      customRegex: '\\(?(:)',
      getItems(query, state, _intl, { prevActive, queryChanged }) {
        if (!prevActive && queryChanged) {
          analyticsService.trackEvent(
            'atlassian.fabric.emoji.typeahead.open',
            {},
          );
        }

        if (query.charAt(query.length - 1) === ' ') {
          analyticsService.trackEvent(
            'atlassian.fabric.emoji.typeahead.space',
            {},
          );
        }

        const pluginState = getEmojiPluginState(state);
        const emojis =
          !prevActive && queryChanged ? [] : pluginState.emojis || [];

        if (queryChanged && pluginState.emojiProvider) {
          pluginState.emojiProvider.filter(query ? `:${query}` : '', {
            limit: defaultListLimit,
            skinTone: pluginState.emojiProvider.getSelectedTone(),
            sort: !query.length
              ? SearchSort.UsageFrequency
              : SearchSort.Default,
          });
        }

        return emojis.map<TypeAheadItem>(emoji => ({
          title: emoji.shortName || '',
          key: emoji.id || emoji.shortName,
          render({ isSelected, onClick, onHover }) {
            return (
              <EmojiTypeAheadItem
                emoji={emoji}
                selected={isSelected}
                onMouseMove={onHover}
                onSelection={onClick}
              />
            );
          },
          emoji,
        }));
      },
      forceSelect(query: string, items: Array<any>) {
        const normalizedQuery = ':' + query;
        return (
          !!isFullShortName(normalizedQuery) &&
          !!items.find(item => item.title.toLowerCase() === normalizedQuery)
        );
      },
      selectItem(state, item, insert, { mode }) {
        console.log({ item });
        const { id = '', type = '', fallback, shortName } = item.emoji;
        const text = fallback || shortName;
        const emojiPluginState = emojiPluginKey.getState(
          state,
        ) as EmojiPluginState;
        const typeAheadPluginState = typeAheadPluginKey.getState(
          state,
        ) as TypeAheadPluginState;
        const pickerElapsedTime = typeAheadPluginState.queryStarted
          ? Date.now() - typeAheadPluginState.queryStarted
          : 0;

        if (
          emojiPluginState.emojiProvider &&
          emojiPluginState.emojiProvider.recordSelection &&
          item.emoji
        ) {
          emojiPluginState.emojiProvider.recordSelection(item.emoji);
        }

        analyticsService.trackEvent('atlassian.fabric.emoji.typeahead.select', {
          mode,
          duration: pickerElapsedTime,
          emojiId: id,
          type: type,
          queryLength: (typeAheadPluginState.query || '').length,
        });

        console.log({ shortName, id, text });
        return addAnalytics(
          insert(
            state.schema.nodes.emoji.createChecked({
              shortName,
              id,
              text,
            }),
          ),
          {
            action: ACTION.INSERTED,
            actionSubject: ACTION_SUBJECT.DOCUMENT,
            actionSubjectId: ACTION_SUBJECT_ID.EMOJI,
            attributes: { inputMethod: INPUT_METHOD.TYPEAHEAD },
            eventType: EVENT_TYPE.TRACK,
          },
        );
      },
      dismiss() {
        analyticsService.trackEvent(
          'atlassian.fabric.emoji.typeahead.close',
          {},
        );
      },
    },
  },
};

export default emojiPlugin;

/**
 * Actions
 */

export const ACTIONS = {
  SET_PROVIDER: 'SET_PROVIDER',
  SET_RESULTS: 'SET_RESULTS',
};

export const setProvider = (provider?: EmojiProvider): Command => (
  state,
  dispatch,
) => {
  if (dispatch) {
    dispatch(
      state.tr.setMeta(emojiPluginKey, {
        action: ACTIONS.SET_PROVIDER,
        params: { provider },
      }),
    );
  }
  return true;
};

export const setResults = (results: {
  emojis: Array<EmojiDescription>;
}): Command => (state, dispatch) => {
  if (dispatch) {
    dispatch(
      state.tr.setMeta(emojiPluginKey, {
        action: ACTIONS.SET_RESULTS,
        params: { results },
      }),
    );
  }
  return true;
};

export type EmojiPluginState = {
  emojiProvider?: EmojiProvider;
  emojis?: Array<EmojiDescription>;
};

export const emojiPluginKey = new PluginKey('emojiPlugin');

export function getEmojiPluginState(state: EditorState) {
  return (emojiPluginKey.getState(state) || {}) as EmojiPluginState;
}

export function emojiPluginFactory(
  dispatch: Dispatch,
  providerFactory: ProviderFactory,
  portalProviderAPI: PortalProviderAPI,
) {
  let emojiProvider: EmojiProvider;
  let emojiProviderChangeHandler: {
    result(res: { emojis: Array<EmojiDescription> }): void;
  };

  return new Plugin({
    key: emojiPluginKey,
    state: {
      init() {
        return {};
      },
      apply(tr, pluginState) {
        const { action, params } = tr.getMeta(emojiPluginKey) || {
          action: null,
          params: null,
        };

        let newPluginState = pluginState;

        switch (action) {
          case ACTIONS.SET_PROVIDER:
            newPluginState = {
              ...pluginState,
              emojiProvider: params.provider,
            };
            dispatch(emojiPluginKey, newPluginState);
            return newPluginState;

          case ACTIONS.SET_RESULTS:
            newPluginState = {
              ...pluginState,
              emojis: params.results.emojis,
            };
            dispatch(emojiPluginKey, newPluginState);
            return newPluginState;
        }

        return newPluginState;
      },
    } as StateField<EmojiPluginState>,
    props: {
      nodeViews: {
        emoji: ReactNodeView.fromComponent(emojiNodeView, portalProviderAPI, {
          providerFactory,
        }),
      },
    },
    view(editorView) {
      const providerHandler = (
        name: string,
        providerPromise?: Promise<EmojiProvider>,
      ) => {
        switch (name) {
          case 'emojiProvider':
            if (!providerPromise) {
              return setProvider(undefined)(
                editorView.state,
                editorView.dispatch,
              );
            }

            (providerPromise as Promise<EmojiProvider>)
              .then(provider => {
                if (emojiProvider && emojiProviderChangeHandler) {
                  emojiProvider.unsubscribe(emojiProviderChangeHandler);
                }

                emojiProvider = provider;
                setProvider(provider)(editorView.state, editorView.dispatch);

                emojiProviderChangeHandler = {
                  result(emojis) {
                    setResults(emojis)(editorView.state, editorView.dispatch);
                  },
                };
                provider.subscribe(emojiProviderChangeHandler);
              })
              .catch(() =>
                setProvider(undefined)(editorView.state, editorView.dispatch),
              );
            break;
        }
      };

      providerFactory.subscribe('emojiProvider', providerHandler);

      return {
        destroy() {
          if (providerFactory) {
            providerFactory.unsubscribe('emojiProvider', providerHandler);
          }
          if (emojiProvider && emojiProviderChangeHandler) {
            emojiProvider.unsubscribe(emojiProviderChangeHandler);
          }
        },
      };
    },
  });
}
