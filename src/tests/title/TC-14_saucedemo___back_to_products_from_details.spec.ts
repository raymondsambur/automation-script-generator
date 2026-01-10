import { test, expect } from '@playwright/test';
import { SauceDemoProductsPage } from '../../framework/pages/title.page';
import { TC_14_Data } from './data/TC_14.data';

test.describe('TC-14 - SauceDemo - Back to Products From Details', () => {
  let page: SauceDemoProductsPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new SauceDemoProductsPage(browserPage);
    await page.login(TC_14_Data.username, TC_14_Data.password);
    await page.navigateToProductDetailsPage(TC_14_Data.itemName);
  });

  test('TC-14 - Navigate back to products from details', async () => {
    await page.navigateBackToProducts();
    await expect(page.page.url()).toContain('/inventory.html');
    await page.verifyProductsPage();
  });
});
