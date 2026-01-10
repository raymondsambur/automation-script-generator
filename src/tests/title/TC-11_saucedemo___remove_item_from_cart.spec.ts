import { test, expect } from '@playwright/test';
import { SauceDemoProductsPage } from '../../framework/pages/title.page';
import { TC_11_Data } from './data/TC_11.data';

test.describe('TC-11 - SauceDemo - Remove Item From Cart', () => {
  let page: SauceDemoProductsPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new SauceDemoProductsPage(browserPage);
  });

  test('TC-11 - Remove Sauce Labs Backpack from cart', async () => {
    await page.login(TC_11_Data.username, TC_11_Data.password);
    await page.addBackpackToCart();
    await page.openCart();
    await page.verifyCartItemName(TC_11_Data.itemName);
    await page.removeBackpackFromCart();
    await page.verifyCartBadgeCount(0);
    await expect(page.page.locator('.inventory_item_name')).not.toContainText(TC_11_Data.itemName);
  });
});
