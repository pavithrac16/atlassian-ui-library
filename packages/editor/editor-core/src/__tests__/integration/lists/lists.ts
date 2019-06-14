import { BrowserTestCase } from '@atlaskit/webdriver-runner/runner';
import Page from '@atlaskit/webdriver-runner/wd-wrapper';
import { getDocFromElement, fullpage, editable } from '../_helpers';

const PM_FOCUS_SELECTOR = '.ProseMirror-focused';

BrowserTestCase(
  `list: shouldn't change focus on tab if the list is not indentable`,
  { skip: ['ie'] },
  async (client: any, testName: string) => {
    const page = new Page(client);
    await page.goto(fullpage.path);
    await page.waitForSelector(fullpage.placeholder);
    await page.click(fullpage.placeholder);

    // Investigate why string based input (without an array) fails in firefox
    // https://product-fabric.atlassian.net/browse/ED-7044
    await page.type(editable, '* '.split(''));
    await page.type(editable, 'abc');
    await page.keys('Return');
    await page.keys('Tab');
    await page.type(editable, '123');
    await page.keys('Tab');

    const doc = await page.$eval(editable, getDocFromElement);
    expect(doc).toMatchCustomDocSnapshot(testName);
    expect(await page.isExisting(PM_FOCUS_SELECTOR)).toBeTruthy();
  },
);
