import { waitForTooltip } from '@atlaskit/visual-regression/helper';
import { snapshot, initFullPageEditorWithAdf, Device } from '../_utils';
import adf from './__fixtures__/default-table.adf.json';
import tableMergedColumnsADF from './__fixtures__/table-with-first-column-merged.json';
import {
  insertRow,
  insertColumn,
  tableSelectors,
  clickFirstCell,
} from '../../__helpers/page-objects/_table';
import { animationFrame } from '../../__helpers/page-objects/_editor';

describe('Snapshot Test: table insert/delete with merged columns', () => {
  let page: any;
  beforeAll(() => {
    // @ts-ignore
    page = global.page;
  });

  beforeEach(async () => {
    await initFullPageEditorWithAdf(
      page,
      tableMergedColumnsADF,
      Device.LaptopHiDPI,
    );
    await clickFirstCell(page);
  });

  test('should be able to insert a column at the end of the table', async () => {
    await insertColumn(page, 0, 'right');
    await snapshot(page);
  });
});

describe('Snapshot Test: table insert/delete', () => {
  let page: any;
  beforeAll(async () => {
    // @ts-ignore
    page = global.page;
  });

  beforeEach(async () => {
    await initFullPageEditorWithAdf(page, adf, Device.LaptopHiDPI);
    await clickFirstCell(page);
  });

  afterEach(async () => {
    await snapshot(page);
  });

  it(`should be able insert after first row`, async () => {
    await page.waitForSelector(tableSelectors.firstRowControl);
    await page.hover(tableSelectors.firstRowControl);
    await page.waitForSelector(tableSelectors.hoveredCell);
  });

  it(`should be able insert after last row`, async () => {
    await page.waitForSelector(tableSelectors.firstRowControl);
    await page.hover(tableSelectors.lastRowControl);
    await page.waitForSelector(tableSelectors.hoveredCell);
  });

  // TODO: measure how flaky this is
  it(`should be able insert after first column`, async () => {
    await page.waitForSelector(tableSelectors.removeTable);
    await animationFrame(page);
    await page.waitForSelector(tableSelectors.firstColumnControl);
    await page.hover(tableSelectors.firstColumnControl);
    await page.waitForSelector(tableSelectors.hoveredCell);
  });

  // TODO: move this to integration tests in future
  it(`should be able to insert row`, async () => {
    await insertRow(page, 1);
    await waitForTooltip(page);
  });

  it(`inserts multiple rows in succession`, async () => {
    await insertRow(page, 1);
    await insertRow(page, 1);
    await insertRow(page, 1);
    await waitForTooltip(page);
  });

  // TODO: move this to integration tests in future
  it(`should be able to insert column`, async () => {
    await insertColumn(page, 1, 'left');
  });
});
