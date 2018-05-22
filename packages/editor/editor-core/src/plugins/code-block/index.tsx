import * as React from 'react';
import { codeBlock } from '@atlaskit/editor-common';
import { EditorPlugin } from '../../types';
import { plugin, stateKey, CodeBlockState } from './pm-plugins/main';
import keymap from './pm-plugins/keymaps';
import LanguagePicker from './ui/LanguagePicker';
import WithPluginState from '../../ui/WithPluginState';
import { setNodeAttributes, deleteNodeAtPos } from './commands';

const codeBlockPlugin: EditorPlugin = {
  nodes() {
    return [{ name: 'codeBlock', node: codeBlock, rank: 800 }];
  },

  pmPlugins() {
    return [
      { rank: 700, plugin: ({ dispatch }) => plugin(dispatch) },
      { rank: 720, plugin: ({ schema }) => keymap(schema) },
    ];
  },

  contentComponent({
    editorView: view,
    appearance,
    popupsMountPoint,
    popupsBoundariesElement,
  }) {
    if (appearance === 'message') {
      return null;
    }
    const domAtPos = pos => {
      const domRef = view.domAtPos(pos);
      return domRef.node.childNodes[domRef.offset];
    };
    return (
      <WithPluginState
        plugins={{ codeBlockState: stateKey }}
        render={({ codeBlockState }: { codeBlockState: CodeBlockState }) => {
          if (codeBlockState.activeCodeBlock) {
            const { pos, node } = codeBlockState.activeCodeBlock;
            const codeBlockDOM = domAtPos(pos) as HTMLElement;
            const setLanguage = (language: string) => {
              setNodeAttributes(pos, { language })(view.state, view.dispatch);
              view.focus();
            };
            const deleteCodeBlock = () =>
              deleteNodeAtPos(pos)(view.state, view.dispatch);
            return (
              <LanguagePicker
                activeCodeBlockDOM={codeBlockDOM}
                setLanguage={setLanguage}
                deleteCodeBlock={deleteCodeBlock}
                activeLanguage={node.attrs.language}
                isEditorFocused={codeBlockState.isEditorFocused}
                popupsMountPoint={popupsMountPoint}
                popupsBoundariesElement={popupsBoundariesElement}
              />
            );
          }
          return null;
        }}
      />
    );
  },
};

export default codeBlockPlugin;
