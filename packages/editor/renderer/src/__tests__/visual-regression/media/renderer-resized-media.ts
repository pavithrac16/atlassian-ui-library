import {
  snapshot,
  deviceViewPorts,
  Device,
  mountRenderer,
  goToRendererTestingExample,
} from '../_utils';
import * as adf from '../../../../examples/helper/media-resize-layout.adf.json';
import { selectors as mediaSelectors } from '../../__helpers/page-objects/_media';
import { selectors as rendererSelectors } from '../../__helpers/page-objects/_renderer';
import { Page } from 'puppeteer';

const devices = [
  Device.LaptopHiDPI,
  Device.LaptopMDPI,
  Device.iPad,
  Device.iPadPro,
  Device.iPhonePlus,
];

// https://product-fabric.atlassian.net/browse/ED-6579
describe.skip('Snapshot Test: Media', () => {
  describe('renderer', () => {
    let page: Page;

    beforeAll(async () => {
      // @ts-ignore
      page = global.page;
      await goToRendererTestingExample(page);
    });

    describe('resized media layout', () => {
      devices.forEach(device => {
        it(`should correctly render ${device}`, async () => {
          await page.setViewport(deviceViewPorts[device]);
          await mountRenderer(page, {
            appearance: 'full-page',
            allowDynamicTextSizing: true,
            document: adf,
          });

          await page.waitForSelector(mediaSelectors.errorLoading); // In test should show overlay error

          await page.waitForSelector(rendererSelectors.document);
          await snapshot(page, 0.01, rendererSelectors.document);
        });
      });
    });
  });
});
