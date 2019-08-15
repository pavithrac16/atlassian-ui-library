import {
  initEditorWithAdf,
  Appearance,
  Device,
  initFullPageEditorWithAdf,
  snapshot,
} from '../_utils';
import { waitForTooltip } from '@atlaskit/visual-regression/helper';
import {
  selectCellOption,
  clickCellOptions,
  getSelectorForTableCell,
  hoverCellOption,
  tableSelectors,
  clickFirstCell,
} from '../../__helpers/page-objects/_table';
import { EditorProps } from '../../../types';
import adfWithMergedRows from './__fixtures__/table-with-merged-rows.adf.json';
import adfWithMedia from './__fixtures__/table-with-media.adf.json';

describe('Table sorting', () => {
  let page: any;
  const editorProps: EditorProps = {
    allowTables: {
      allowColumnSorting: true,
    },
  };

  beforeAll(async () => {
    // @ts-ignore
    page = global.page;
  });

  describe('when there is big cells', () => {
    beforeEach(async () => {
      await initEditorWithAdf(page, {
        appearance: Appearance.fullPage,
        adf: adfWithMedia,
        viewport: { width: 1040, height: 600 },
        editorProps,
      });

      await clickFirstCell(page);
    });

    it('should update rows controls', async () => {
      const firstCell = getSelectorForTableCell({
        row: 1,
        cell: 1,
        cellType: 'th',
      });

      await page.click(firstCell);
      await clickCellOptions(page);
      await selectCellOption(page, tableSelectors.sortColumnDESC);
      await snapshot(page);
    });
  });

  describe('when there is merged cells', () => {
    beforeEach(async () => {
      await initFullPageEditorWithAdf(
        page,
        adfWithMergedRows,
        Device.LaptopHiDPI,
        undefined,
        editorProps,
      );
      await clickFirstCell(page);
    });

    it('should hovered the merged cells', async () => {
      const firstCell = getSelectorForTableCell({
        row: 1,
        cell: 1,
        cellType: 'td',
      });

      await page.click(firstCell);
      await clickCellOptions(page);
      await hoverCellOption(page, tableSelectors.sortColumnASC);
      await waitForTooltip(page);
      await snapshot(page, {}, tableSelectors.tableWrapper);
    });
  });
});
