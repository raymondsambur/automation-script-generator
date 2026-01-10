import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../../framework/pages/authentication.page';
import { TC_15_Data } from './data/TC_15.data';

test.describe('TC-15 - SauceDemo - Logout From Menu', () => {
  let page: SauceDemoPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new SauceDemoPage(browserPage);
    await page.navigateToLoginPage();
    await page.enterUsername(TC_15_Data.username);
    await page.enterPassword(TC_15_Data.password);
    await page.clickLogin();
  });

  test('TC-15 - SauceDemo - Logout From Menu', async () => {
    await page.logout();
    const currentUrl = await page.page.url();
    expect(currentUrl).not.toContain('/inventory.html');
    await page.verifyLoginButtonIsVisible();
  });
});
