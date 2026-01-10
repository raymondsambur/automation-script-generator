import { test, expect } from '@playwright/test';
import { SauceDemoProductsPage } from '../../framework/pages/title.page';
import { TC_10_Data } from './data/TC_10.data';

test.describe('TC-10 - SauceDemo - Add Multiple Items to Cart', () => {
  let page: SauceDemoProductsPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new SauceDemoProductsPage(browserPage);
    await page.login(TC_10_Data.username, TC_10_Data.password);
  });

  test('TC-10 - Add Multiple Items to Cart', async () => {
    await page.addBackpackToCart();
    await page.addBikeLightToCart();
    await page.openCart();

    await page.verifyCartItemName(TC_10_Data.items[0]);
    await page.verifyCartItemName(TC_10_Data.items[1]);

    await page.verifyCartItemQuantity(TC_10_Data.items[0], 1);
    await page.verifyCartItemQuantity(TC_10_Data.items[1], 1);

    expect(page.page.url()).toContain('/cart.html');
  });
});
