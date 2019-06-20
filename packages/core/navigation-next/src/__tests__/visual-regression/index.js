// @flow

import {
  getExampleUrl,
  takeScreenShot,
} from '@atlaskit/visual-regression/helper';

describe('Snapshot Test', () => {
  it('Basic navigation next should match prod', async () => {
    const url = getExampleUrl(
      'core',
      'navigation-next',
      'navigation-app',
      global.__BASEURL__,
    );
    const image = await takeScreenShot(global.page, url);
    //$FlowFixMe
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should match product nav', async () => {
    const url = getExampleUrl(
      'core',
      'navigation-next',
      'navigation-with-switcher',
      global.__BASEURL__,
    );
    const { page } = global;
    await page.goto(url);
    const image = await takeScreenShot(page, url);
    //$FlowFixMe
    expect(image).toMatchProdImageSnapshot(); // Snapshot of product nav
  });

  it('Should match With Banner', async () => {
    const url = getExampleUrl(
      'core',
      'navigation-next',
      'with-banner',
      global.__BASEURL__,
    );
    const image = await takeScreenShot(global.page, url);
    //$FlowFixMe
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should match switcher', async () => {
    const url = getExampleUrl(
      'core',
      'navigation-next',
      'navigation-with-switcher',
      global.__BASEURL__,
    );
    const { page } = global;
    await page.goto(url);

    await page.click(
      `[data-webdriver-test-key="container-navigation"] [data-test-id="NavigationItem"]`,
    );
    await page.waitFor(300);

    const imageWithProjectSwitcher = await page.screenshot();
    //$FlowFixMe
    expect(imageWithProjectSwitcher).toMatchProdImageSnapshot();
  });

  it('Should match Global nav', async () => {
    const url = getExampleUrl(
      'core',
      'navigation-next',
      'global-nav',
      global.__BASEURL__,
    );
    const { page } = global;
    await page.goto(url);
    await page.setViewport({ width: 1500, height: 700 });

    const image = await takeScreenShot(page, url);
    //$FlowFixMe
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should match Theming', async () => {
    const url = getExampleUrl(
      'core',
      'navigation-next',
      'theming',
      global.__BASEURL__,
    );
    const { page } = global;
    await page.goto(url);
    await page.setViewport({ width: 1500, height: 1700 });
    const image = await takeScreenShot(page, url);
    //$FlowFixMe
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should match item', async () => {
    const url = getExampleUrl(
      'core',
      'navigation-next',
      'item',
      global.__BASEURL__,
    );

    const { page } = global;
    await page.goto(url);
    await page.setViewport({ width: 900, height: 1350 });
    const image = await takeScreenShot(page, url);
    //$FlowFixMe
    expect(image).toMatchProdImageSnapshot();
  });

  it('Should match collapsed nav screenshot', async () => {
    const url = getExampleUrl(
      'core',
      'navigation-next',
      'navigation-app',
      global.__BASEURL__,
    );
    const { page } = global;
    // TODO: Fix button selector
    const button = "[data-test-id='Navigation'] > div:last-of-type button";

    await page.goto(url);
    await page.setViewport({ width: 750, height: 700 });
    await page.waitForSelector(button);
    await page.click(button);
    await page.waitFor(300);

    const image = await takeScreenShot(page, url);
    //$FlowFixMe
    expect(image).toMatchProdImageSnapshot();
    await page.click(button);
  });

  it('Should match dynamic theme styles', async () => {
    const url = getExampleUrl(
      'core',
      'navigation-next',
      'navigation-with-dynamic-theme-styles',
      global.__BASEURL__,
    );
    const { page } = global;
    // TODO: Fix button selector
    const button = '#toggle-shadow';

    await page.goto(url);
    await page.waitForSelector(button);
    await page.click(button);

    const image = await takeScreenShot(page, url);
    //$FlowFixMe
    expect(image).toMatchProdImageSnapshot();
    await page.click(button);
  });
});
