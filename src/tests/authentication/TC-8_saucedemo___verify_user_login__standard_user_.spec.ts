import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../../framework/pages/authentication.page';
import { TC_8_Data } from './data/TC_8.data';

test.describe('TC-8 - SauceDemo - Verify User Login (Standard User)', () => {
  let page: SauceDemoPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new SauceDemoPage(browserPage);
  });

  test('TC-8 - SauceDemo - Verify User Login (Standard User)', async () => {
    await page.navigateToLoginPage();
    await page.enterUsername(TC_8_Data.username);
    await page.enterPassword(TC_8_Data.password);
    await page.clickLogin();
    await page.waitForProductsHeader();
    await page.verifyUrlContainsInventory();
    const currentUrl = await page.page.url();
    expect(currentUrl).toContain(TC_8_Data.expectedUrlContains);
    const productsHeader = await page.page.textContent('[data-test="title"]');
    expect(productsHeader).toBe(TC_8_Data.expectedPageHeader);
  });
});
