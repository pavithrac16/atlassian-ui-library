import tablePlugins, { TableState } from '../../../src/plugins/table';
import tableCommands from '../../../src/plugins/table/commands';
import { CellSelection, TableMap } from 'prosemirror-tables';
import {
  createEvent,
  doc,
  p,
  makeEditor,
  thEmpty,
  table,
  tr,
  td,
  th,
  tdEmpty,
  tdCursor,
  code_block,
  code,
  thCursor,
  strong,
} from '@atlaskit/editor-test-helpers';
import { setTextSelection } from '../../../src/utils';
import { analyticsService } from '../../../src/analytics';
import {
  selectRow,
  selectColumn,
  selectTable,
} from '../../../src/editor/plugins/table/actions';
import {
  isColumnSelected,
  isRowSelected,
} from '../../../src/editor/plugins/table/utils';

describe('table plugin', () => {
  const event = createEvent('event');
  const editor = (doc: any) =>
    makeEditor<TableState>({
      doc,
      plugins: tablePlugins(),
    });
  let trackEvent;
  beforeEach(() => {
    trackEvent = jest.fn();
    analyticsService.trackEvent = trackEvent;
  });

  describe('subscribe', () => {
    it('calls subscriber with plugin', () => {
      const { pluginState } = editor(doc(p('paragraph')));
      const spy = jest.fn();
      pluginState.subscribe(spy);

      expect(spy).toHaveBeenCalledWith(pluginState);
    });

    it('should not be possible to add same listener twice', () => {
      const { pluginState } = editor(doc(p('paragraph')));
      const spy1 = jest.fn();
      pluginState.subscribe(spy1);
      pluginState.subscribe(spy1);

      expect(spy1).toHaveBeenCalledTimes(1);
    });

    describe('when leaving table', () => {
      it('notifies subscriber', () => {
        const { refs, pluginState, editorView } = editor(
          doc(p('{pPos}'), table(tr(tdCursor, tdEmpty, tdEmpty))),
        );
        const spy = jest.fn();
        const { pPos } = refs;

        pluginState.subscribe(spy);
        setTextSelection(editorView, pPos);

        expect(spy).toHaveBeenCalledTimes(2);
        editorView.destroy();
      });
    });

    describe('when entering table', () => {
      it('notifies subscriber', () => {
        const { refs, pluginState, editorView } = editor(
          doc(p('{<>}'), table(tr(td({})(p('{nextPos}')), tdEmpty, tdEmpty))),
        );
        const spy = jest.fn();
        const { nextPos } = refs;

        pluginState.subscribe(spy);
        setTextSelection(editorView, nextPos);

        expect(spy).toHaveBeenCalledTimes(2);
        editorView.destroy();
      });
    });

    describe('when moving cursor to a different table', () => {
      it('notifies subscriber', () => {
        const { refs, pluginState, editorView } = editor(
          doc(
            table(tr(tdCursor, tdEmpty, tdEmpty)),
            table(tr(td({})(p('{nextPos}')), tdEmpty, tdEmpty)),
          ),
        );
        const spy = jest.fn();
        const { nextPos } = refs;

        pluginState.subscribe(spy);
        setTextSelection(editorView, nextPos);

        expect(spy).toHaveBeenCalledTimes(2);
        editorView.destroy();
      });
    });

    describe('when moving within the same table', () => {
      it('notifies subscriber', () => {
        const { refs, pluginState, editorView } = editor(
          doc(table(tr(tdCursor, tdEmpty, td({})(p('{nextPos}'))))),
        );
        const spy = jest.fn();
        const { nextPos } = refs;

        pluginState.subscribe(spy);
        setTextSelection(editorView, nextPos);

        expect(spy).not.toHaveBeenCalledTimes(2);
        editorView.destroy();
      });
    });

    describe('when unsubscribe', () => {
      it('does not notify the subscriber', () => {
        const { pluginState } = editor(
          doc(table(tr(tdCursor, tdEmpty, tdEmpty))),
        );
        const spy = jest.fn();
        pluginState.subscribe(spy);

        pluginState.unsubscribe(spy);

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('editorFocued', () => {
    describe('when editor is focused', () => {
      it('it is true', () => {
        const { plugin, editorView, pluginState } = editor(
          doc(table(tr(tdCursor, tdEmpty, tdEmpty))),
        );
        plugin.props.handleDOMEvents!.focus(editorView, event);
        expect(pluginState.editorFocused).toEqual(true);
        editorView.destroy();
      });
    });

    describe('when editor is not focused', () => {
      it('it is false', () => {
        const { plugin, editorView, pluginState } = editor(
          doc(table(tr(tdCursor, tdEmpty, tdEmpty))),
        );
        plugin.props.handleDOMEvents!.blur(editorView, event);
        expect(pluginState.editorFocused).toEqual(false);
        editorView.destroy();
      });
    });
  });

  describe('createTable()', () => {
    describe('when the cursor is inside the table', () => {
      it('it should not create a new table and return false', () => {
        const tableNode = table(tr(tdCursor));
        const { plugin, editorView } = editor(doc(tableNode));
        plugin.props.handleDOMEvents!.focus(editorView, event);
        expect(
          tableCommands.createTable()(editorView.state, editorView.dispatch),
        ).toEqual(false);
        expect(editorView.state.doc).toEqualDocument(doc(tableNode));
        editorView.destroy();
      });
    });

    describe('when the cursor is inside a codeblock', () => {
      it('it should not create a new table and return false', () => {
        const node = code_block()('{<>}');
        const { editorView } = editor(doc(node));
        expect(
          tableCommands.createTable()(editorView.state, editorView.dispatch),
        ).toEqual(false);
        expect(editorView.state.doc).toEqualDocument(doc(node));
        editorView.destroy();
      });
    });

    describe('when the cursor is inside inline code', () => {
      it('it should not create a new table and return false', () => {
        const node = p(code('te{<>}xt'));
        const { editorView } = editor(doc(node));
        expect(
          tableCommands.createTable()(editorView.state, editorView.dispatch),
        ).toEqual(false);
        expect(editorView.state.doc).toEqualDocument(doc(node));
        editorView.destroy();
      });
    });

    describe('when the cursor is outside the table', () => {
      it('it should create a new table and return true', () => {
        const { editorView } = editor(doc(p('{<>}')));
        expect(
          tableCommands.createTable()(editorView.state, editorView.dispatch),
        ).toEqual(true);
        const tableNode = table(
          tr(thEmpty, thEmpty, thEmpty),
          tr(tdEmpty, tdEmpty, tdEmpty),
          tr(tdEmpty, tdEmpty, tdEmpty),
        );
        expect(editorView.state.doc).toEqualDocument(doc(tableNode));
        editorView.destroy();
      });
    });

    describe('when selection has a mark', () => {
      it('it should create a new table and return true', () => {
        const { editorView } = editor(doc(p(strong('text{<>}'))));
        expect(
          tableCommands.createTable()(editorView.state, editorView.dispatch),
        ).toEqual(true);
        expect(editorView.state.doc).toEqualDocument(
          doc(
            p(strong('text')),
            table(
              tr(thEmpty, thEmpty, thEmpty),
              tr(tdEmpty, tdEmpty, tdEmpty),
              tr(tdEmpty, tdEmpty, tdEmpty),
            ),
          ),
        );
        editorView.destroy();
      });
    });
  });

  describe('insertColumn(number)', () => {
    describe('when table has 2 columns', () => {
      describe('when it called with 0', () => {
        it("it should prepend a new column and move cursor inside it's first cell", () => {
          const { plugin, pluginState, editorView } = editor(
            doc(p('text'), table(tr(td({})(p('c1')), td({})(p('c2{<>}'))))),
          );
          plugin.props.handleDOMEvents!.focus(editorView, event);
          pluginState.insertColumn(0);
          expect(editorView.state.doc).toEqualDocument(
            doc(
              p('text'),
              table(tr(tdCursor, td({})(p('c1')), td({})(p('c2')))),
            ),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.column.button',
          );
          editorView.destroy();
        });
      });

      describe('when it called with 1', () => {
        it("it should insert a new column in the middle and move cursor inside it's first cell", () => {
          const { plugin, pluginState, editorView } = editor(
            doc(p('text'), table(tr(td({})(p('c1{<>}')), td({})(p('c2'))))),
          );
          plugin.props.handleDOMEvents!.focus(editorView, event);
          pluginState.insertColumn(1);
          expect(editorView.state.doc).toEqualDocument(
            doc(
              p('text'),
              table(tr(td({})(p('c1')), tdCursor, td({})(p('c2')))),
            ),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.column.button',
          );
          editorView.destroy();
        });
      });

      describe('when it called with 2', () => {
        it("it should append a new column and move cursor inside it's first cell", () => {
          const { plugin, pluginState, editorView } = editor(
            doc(p('text'), table(tr(td({})(p('c1{<>}')), td({})(p('c2'))))),
          );
          plugin.props.handleDOMEvents!.focus(editorView, event);
          pluginState.insertColumn(2);
          expect(editorView.state.doc).toEqualDocument(
            doc(
              p('text'),
              table(tr(td({})(p('c1')), td({})(p('c2')), tdCursor)),
            ),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.column.button',
          );
          editorView.destroy();
        });
      });
    });
  });

  describe('insertRow(number)', () => {
    describe('when table has 2 rows', () => {
      describe('when it called with 0', () => {
        it("it should prepend a new row and move cursor inside it's first cell", () => {
          const { plugin, pluginState, editorView } = editor(
            doc(
              p('text'),
              table(tr(td({})(p('row1'))), tr(td({})(p('row2{<>}')))),
            ),
          );
          plugin.props.handleDOMEvents!.focus(editorView, event);
          pluginState.insertRow(0);
          expect(editorView.state.doc).toEqualDocument(
            doc(
              p('text'),
              table(tr(tdCursor), tr(td({})(p('row1'))), tr(td({})(p('row2')))),
            ),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.row.button',
          );
          editorView.destroy();
        });
      });

      describe('when it called with 1', () => {
        it("it should insert a new row in the middle and move cursor inside it's first cell", () => {
          const { plugin, pluginState, editorView } = editor(
            doc(
              p('text'),
              table(tr(td({})(p('row1{<>}'))), tr(td({})(p('row2')))),
            ),
          );
          plugin.props.handleDOMEvents!.focus(editorView, event);
          pluginState.insertRow(1);
          expect(editorView.state.doc).toEqualDocument(
            doc(
              p('text'),
              table(tr(td({})(p('row1'))), tr(tdCursor), tr(td({})(p('row2')))),
            ),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.row.button',
          );
          editorView.destroy();
        });
      });
    });

    describe('when table has 2 row', () => {
      describe('when it called with 2', () => {
        it("it should append a new row and move cursor inside it's first cell", () => {
          const { plugin, pluginState, editorView } = editor(
            doc(
              p('text'),
              table(tr(td({})(p('row1{<>}'))), tr(td({})(p('row2')))),
            ),
          );
          plugin.props.handleDOMEvents!.focus(editorView, event);
          pluginState.insertRow(2);
          expect(editorView.state.doc).toEqualDocument(
            doc(
              p('text'),
              table(tr(td({})(p('row1'))), tr(td({})(p('row2'))), tr(tdCursor)),
            ),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.row.button',
          );
          editorView.destroy();
        });
      });
    });
  });

  describe('selectColumn(number)', () => {
    describe('when table has 3 columns', () => {
      [0, 1, 2].forEach(column => {
        describe(`when called with ${column}`, () => {
          it(`it should select ${column} column`, () => {
            const { plugin, pluginState, editorView } = editor(
              doc(p('text'), table(tr(tdCursor, tdEmpty, tdEmpty))),
            );
            plugin.props.handleDOMEvents!.focus(editorView, event);
            selectColumn(column)(editorView.state, editorView.dispatch);
            const selection = (editorView.state
              .selection as any) as CellSelection;
            const map = TableMap.get(pluginState.tableNode!);
            const start = selection.$anchorCell.start(-1);
            const anchor = map.colCount(selection.$anchorCell.pos - start);
            const head = map.colCount(selection.$headCell.pos - start);
            expect(anchor).toEqual(column);
            expect(head).toEqual(column);
            expect(selection.isColSelection()).toEqual(true);
            editorView.destroy();
          });
        });
      });
    });
  });

  describe('selectRow(number)', () => {
    describe('when table has 3 rows', () => {
      [0, 1, 2].forEach(row => {
        describe(`when called with ${row}`, () => {
          it(`it should select ${row} row`, () => {
            const { plugin, editorView } = editor(
              doc(p('text'), table(tr(tdCursor), tr(tdEmpty), tr(tdEmpty))),
            );
            plugin.props.handleDOMEvents!.focus(editorView, event);
            selectRow(row)(editorView.state, editorView.dispatch);
            const selection = (editorView.state
              .selection as any) as CellSelection;
            const anchor = selection.$anchorCell.index(-1);
            const head = selection.$headCell.index(-1);
            expect(anchor).toEqual(row);
            expect(head).toEqual(row);
            expect(selection.isRowSelection()).toEqual(true);
            editorView.destroy();
          });
        });
      });
    });
  });

  describe('selectTable()', () => {
    it('it should select the whole table', () => {
      const { plugin, editorView } = editor(
        doc(p('text'), table(tr(tdCursor), tr(tdEmpty), tr(tdEmpty))),
      );
      plugin.props.handleDOMEvents!.focus(editorView, event);
      selectTable(editorView.state, editorView.dispatch);
      const selection = (editorView.state.selection as any) as CellSelection;
      expect(selection.isRowSelection()).toEqual(true);
      expect(selection.isColSelection()).toEqual(true);
      editorView.destroy();
    });
  });

  describe('isColumnSelected(number)', () => {
    describe('when table has 3 columns', () => {
      [0, 1, 2].forEach(column => {
        describe(`when column ${column} is selected`, () => {
          describe(`when called with ${column}`, () => {
            it(`it should return true`, () => {
              const { plugin, editorView } = editor(
                doc(p('text'), table(tr(tdCursor, tdEmpty, tdEmpty))),
              );
              plugin.props.handleDOMEvents!.focus(editorView, event);
              selectColumn(column)(editorView.state, editorView.dispatch);
              expect(isColumnSelected(column, editorView.state)).toEqual(true);
              editorView.destroy();
            });
          });
        });
      });
    });
  });

  describe('isRowSelected(number)', () => {
    describe('when table has 3 rows', () => {
      [0, 1, 2].forEach(row => {
        describe(`when row ${row} is selected`, () => {
          describe(`when called with ${row}`, () => {
            it(`it should return true`, () => {
              const { plugin, editorView } = editor(
                doc(p('text'), table(tr(tdCursor), tr(tdEmpty), tr(tdEmpty))),
              );
              plugin.props.handleDOMEvents!.focus(editorView, event);
              selectRow(row)(editorView.state, editorView.dispatch);
              expect(isRowSelected(row, editorView.state)).toEqual(true);
              editorView.destroy();
            });
          });
        });
      });
    });
  });

  describe('remove()', () => {
    describe('when table has 3 columns', () => {
      describe('when the first column is selected', () => {
        it('it should remove the first column and move cursor to the first cell of the column to the left', () => {
          const { plugin, pluginState, editorView, refs } = editor(
            doc(
              p('text'),
              table(tr(td({})(p('{nextPos}')), tdCursor, tdEmpty)),
            ),
          );
          const { nextPos } = refs;
          plugin.props.handleDOMEvents!.focus(editorView, event);
          selectColumn(0)(editorView.state, editorView.dispatch);
          pluginState.remove();
          expect(editorView.state.doc).toEqualDocument(
            doc(p('text'), table(tr(tdCursor, tdEmpty))),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.delete_column.button',
          );
          expect(editorView.state.selection.$from.pos).toEqual(nextPos);
          editorView.destroy();
        });
      });

      describe('when the middle column is selected', () => {
        it('it should remove the middle column and move cursor to the first cell of the column to the left', () => {
          const { plugin, pluginState, editorView, refs } = editor(
            doc(
              p('text'),
              table(tr(td({})(p('{nextPos}')), tdCursor, tdEmpty)),
            ),
          );
          const { nextPos } = refs;
          plugin.props.handleDOMEvents!.focus(editorView, event);
          selectColumn(1)(editorView.state, editorView.dispatch);
          pluginState.remove();
          expect(editorView.state.doc).toEqualDocument(
            doc(p('text'), table(tr(tdCursor, tdEmpty))),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.delete_column.button',
          );
          expect(editorView.state.selection.$from.pos).toEqual(nextPos);
          editorView.destroy();
        });
      });

      describe('when the header row is selected', () => {
        const editorTableHeader = (doc: any) =>
          makeEditor<TableState>({
            doc,
            plugins: tablePlugins({ isHeaderRowRequired: true }),
          });
        it('it should convert first following row to header if pluginState.isHeaderRowRequired is true', () => {
          const { plugin, pluginState, editorView } = editorTableHeader(
            doc(table(tr(thCursor), tr(tdEmpty), tr(tdEmpty))),
          );
          plugin.props.handleDOMEvents!.focus(editorView, event);
          selectRow(0)(editorView.state, editorView.dispatch);
          pluginState.remove();
          expect(editorView.state.doc).toEqualDocument(
            doc(table(tr(th({})(p())), tr(tdEmpty))),
          );
          editorView.destroy();
        });

        it('it should move cursor to the first cell of the new header row', () => {
          const { plugin, pluginState, editorView, refs } = editorTableHeader(
            doc(
              table(
                tr(th({})(p('{nextPos}testing{<>}'))),
                tr(tdEmpty),
                tr(tdEmpty),
              ),
            ),
          );
          const { nextPos } = refs;
          plugin.props.handleDOMEvents!.focus(editorView, event);
          selectRow(0)(editorView.state, editorView.dispatch);
          pluginState.remove();
          expect(editorView.state.selection.$from.pos).toEqual(nextPos);
          expect(editorView.state.selection.$to.pos).toEqual(nextPos);
          editorView.destroy();
        });
      });

      describe('when the last column is selected', () => {
        it('it should remove the last column and move cursor to the first cell of the previous column', () => {
          const { plugin, pluginState, editorView, refs } = editor(
            doc(
              p('text'),
              table(tr(tdCursor, td({})(p('{nextPos}')), tdCursor)),
            ),
          );
          const { nextPos } = refs;
          plugin.props.handleDOMEvents!.focus(editorView, event);
          selectColumn(2)(editorView.state, editorView.dispatch);
          pluginState.remove();
          expect(editorView.state.doc).toEqualDocument(
            doc(p('text'), table(tr(tdCursor, tdEmpty))),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.delete_column.button',
          );
          expect(editorView.state.selection.$from.pos).toEqual(nextPos);
          editorView.destroy();
        });
      });
    });

    describe('when table has 3 rows', () => {
      describe('when the first row is selected', () => {
        it('it should remove the first row and move cursor to the first cell of the first row', () => {
          const { plugin, pluginState, editorView, refs } = editor(
            doc(
              p('text'),
              table(tr(td({})(p('{nextPos}'))), tr(tdCursor), tr(tdEmpty)),
            ),
          );
          const { nextPos } = refs;
          plugin.props.handleDOMEvents!.focus(editorView, event);
          selectRow(0)(editorView.state, editorView.dispatch);
          pluginState.remove();
          expect(editorView.state.doc).toEqualDocument(
            doc(p('text'), table(tr(tdCursor), tr(tdEmpty))),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.delete_row.button',
          );
          expect(editorView.state.selection.$from.pos).toEqual(nextPos);
          editorView.destroy();
        });
      });

      describe('when the middle row is selected', () => {
        it('it should remove the middle row and move cursor to the first cell of the next row', () => {
          const { plugin, pluginState, editorView, refs } = editor(
            doc(
              p('text'),
              table(tr(tdCursor), tr(td({})(p('{nextPos}'))), tr(tdEmpty)),
            ),
          );
          const { nextPos } = refs;
          plugin.props.handleDOMEvents!.focus(editorView, event);
          selectRow(1)(editorView.state, editorView.dispatch);
          pluginState.remove();
          expect(editorView.state.doc).toEqualDocument(
            doc(p('text'), table(tr(tdEmpty), tr(tdCursor))),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.delete_row.button',
          );
          expect(editorView.state.selection.$from.pos).toEqual(nextPos);
          editorView.destroy();
        });
      });

      describe('when the last row is selected', () => {
        it('it should remove the middle row and move cursor to the first cell of the previous row', () => {
          const { plugin, pluginState, editorView, refs } = editor(
            doc(
              p('text'),
              table(tr(tdCursor), tr(td({})(p('{nextPos}'))), tr(tdEmpty)),
            ),
          );
          const { nextPos } = refs;
          plugin.props.handleDOMEvents!.focus(editorView, event);
          selectRow(2)(editorView.state, editorView.dispatch);
          pluginState.remove();
          expect(editorView.state.doc).toEqualDocument(
            doc(p('text'), table(tr(tdEmpty), tr(tdCursor))),
          );
          expect(trackEvent).toHaveBeenCalledWith(
            'atlassian.editor.format.table.delete_row.button',
          );
          expect(editorView.state.selection.$from.pos).toEqual(nextPos);
          editorView.destroy();
        });
      });
    });
  });
});
