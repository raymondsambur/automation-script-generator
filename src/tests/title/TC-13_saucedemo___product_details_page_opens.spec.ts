import { test, expect } from '@playwright/test';
import { SauceDemoProductsPage } from '../../framework/pages/title.page';
import { TC_13_Data } from './data/TC_13.data';

test.describe('TC-13 - SauceDemo - Product Details Page Opens', () => {
  let myPage: SauceDemoProductsPage;

  test.beforeEach(async ({ page }) => {
    myPage = new SauceDemoProductsPage(page);
    await myPage.page.goto(TC_13_Data.url);
    await myPage.login(TC_13_Data.username, TC_13_Data.password);
  });

  test('TC-13 - Product Details Page Opens', async () => {
    await myPage.navigateToProductDetailsPage(TC_13_Data.itemName);
    await myPage.verifyProductDetailsPage();
    const url = myPage.page.url();
    expect(url).toContain('/inventory-item.html');
    const itemName = await myPage.page.textContent('.inventory_details_name');
    expect(itemName).toBe(TC_13_Data.itemName);
  });
});
