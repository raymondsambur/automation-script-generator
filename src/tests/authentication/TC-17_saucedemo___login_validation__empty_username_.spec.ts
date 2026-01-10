import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../../framework/pages/authentication.page';
import { TC_17_Data } from './data/TC_17.data';

test.describe('TC-17 - SauceDemo - Login Validation (Empty Username)', () => {
  let page: SauceDemoPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new SauceDemoPage(browserPage);
  });

  test('TC-17 - SauceDemo - Login Validation (Empty Username)', async () => {
    await page.navigateToLoginPage();
    await page.enterUsername(TC_17_Data.username);
    await page.enterPassword(TC_17_Data.password);
    await page.clickLogin();
    await page.waitForErrorMessage();
    const currentUrl = await page.page.url();
    expect(currentUrl).toBe(TC_17_Data.url);
  });
});
