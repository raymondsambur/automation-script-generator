import { test, expect } from '@playwright/test';
import { SauceDemoLoginPage } from '../../framework/pages/authentication.page';
import { TC_16_Data } from './data/TC_16.data';

test.describe('TC-16 - SauceDemo - Login Fails (Locked Out User)', () => {
  let page: SauceDemoLoginPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new SauceDemoLoginPage(browserPage);
    await page.navigateToLoginPage();
  });

  test('TC-16 - SauceDemo - Login Fails (Locked Out User)', async () => {
    await page.enterUsername(TC_16_Data.username);
    await page.enterPassword(TC_16_Data.password);
    await page.clickLogin();
    await page.waitForErrorMessage();
    const errorMessage = await page.page.locator('[data-test="error"]').textContent();
    expect(errorMessage).toContain('Epic sadface: Sorry, this user has been locked out.');
    const currentPageUrl = await page.page.url();
    expect(currentPageUrl).not.toContain('/inventory.html');
  });
});
