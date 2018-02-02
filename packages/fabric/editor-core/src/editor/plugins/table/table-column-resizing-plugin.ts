import { Plugin, PluginKey, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { stateKey as tablePluginKey } from '../../../plugins/table';
import { columnResizingPluginKey } from 'prosemirror-tables';

export const pluginKey = new PluginKey('tableColumnResizingCustomPlugin');

const updateControls = (state: EditorState) => {
  const { tableElement } = tablePluginKey.getState(state);
  if (!tableElement) {
    return;
  }
  const cols = tableElement.querySelector('tr')!.children;
  const headerCols: any = tableElement.parentElement.querySelectorAll(
    '.table-column',
  );

  for (let i = 0, count = headerCols.length; i < count; i++) {
    headerCols[i].style.width = `${cols[i].offsetWidth + 1}px`;
  }

  const rightShadow = tableElement.parentElement.parentElement.querySelector(
    '.table-shadow.-right',
  );
  if (rightShadow) {
    const { offsetWidth, scrollLeft } = tableElement.parentElement;
    const diff = tableElement.offsetWidth - offsetWidth;
    const scrollDiff = scrollLeft - diff > 0 ? scrollLeft - diff : 0;
    const width = diff > 0 ? Math.min(diff, 10) : 0;
    rightShadow.style.width = `${width}px`;
    rightShadow.style.left = `${offsetWidth - width - scrollDiff}px`;
  }
};

const plugin = new Plugin({
  key: pluginKey,
  props: {
    handleDOMEvents: {
      mousemove(view: EditorView) {
        const { dragging } = columnResizingPluginKey.getState(view.state);
        if (dragging) {
          updateControls(view.state);
        }
        return false;
      },
      mouseleave(view: EditorView) {
        updateControls(view.state);
        return false;
      },
    },

    attributes: () => ({ class: 'table-resizing' }),
  },
});

export default plugin;
