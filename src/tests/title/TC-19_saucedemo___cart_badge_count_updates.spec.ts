import { test, expect } from '@playwright/test';
import { SauceDemoProductsPage } from '../../framework/pages/title.page';
import { TC_19_Data } from './data/TC_19.data';

test.describe('TC-19 - SauceDemo - Cart Badge Count Updates', () => {
  let myPage: SauceDemoProductsPage;

  test.beforeEach(async ({ page }) => {
    myPage = new SauceDemoProductsPage(page);
    await myPage.login(TC_19_Data.username, TC_19_Data.password);
  });

  test('TC-19 - SauceDemo - Cart Badge Count Updates', async () => {
    // Step 2: Add Sauce Labs Backpack to the cart.
    await myPage.addBackpackToCart();

    // Step 3: Verify the cart badge shows 1.
    await myPage.verifyCartBadgeCount(1);

    // Step 4: Add Sauce Labs Bike Light to the cart.
    await myPage.addBikeLightToCart();

    // Step 5: Verify the cart badge shows 2.
    await myPage.verifyCartBadgeCount(2);

    // Step 6: Remove Sauce Labs Bike Light.
    await myPage.removeBikeLightFromCart();

    // Step 7: Verify the cart badge shows 1.
    await myPage.verifyCartBadgeCount(1);
  });
});
