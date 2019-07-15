import { snapshot, initEditorWithAdf, Appearance } from '../_utils';
import {
  insertMedia,
  waitForMediaToBeLoaded,
  clickMediaInPosition,
  clickOnToolbarButton,
  MediaToolbarButton,
  waitForActivityItems,
} from '../../__helpers/page-objects/_media';
import { pressKey } from '../../__helpers/page-objects/_keyboard';

describe('Snapshot Test: Media', () => {
  let page: any;
  beforeEach(async () => {
    // @ts-ignore
    page = global.page;
    await initEditorWithAdf(page, {
      appearance: Appearance.fullPage,
      editorProps: {
        media: {
          allowMediaSingle: true,
          allowMediaGroup: true,
          allowResizing: false,
        },
      },
    });
  });

  describe('Media Linking Toolbar', () => {
    describe('Media Single', () => {
      beforeEach(async () => {
        // now we can insert media as necessary
        await insertMedia(page);
        await waitForMediaToBeLoaded(page);
        await clickMediaInPosition(page, 0);
      });

      it('should show add link button', async () => {
        await snapshot(page);
      });

      it('should open media linking toolbar', async () => {
        await clickOnToolbarButton(page, MediaToolbarButton.addLink);

        await waitForActivityItems(page, 5);
        await snapshot(page);
      });

      it('should show edit media linking toolbar', async () => {
        await clickOnToolbarButton(page, MediaToolbarButton.addLink);
        await waitForActivityItems(page, 5);

        await pressKey(page, ['ArrowDown', 'Enter']);

        await snapshot(page);
      });
    });
  });
});