import { test, expect } from '@playwright/test';
import { SauceDemoProductsPage } from '../../framework/pages/title.page';
import { standardUser, inventoryItems } from './title.data';

test.describe('SauceDemo - Cart Badge Count Updates', () => {
  let page: SauceDemoProductsPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new SauceDemoProductsPage(browserPage);
    await page.login(standardUser.username, standardUser.password);
    await page.verifyProductsPage();
  });

  test('should update cart badge count when adding and removing items', async () => {
    // Add Sauce Labs Backpack to the cart
    await page.addBackpackToCart();
    await page.verifyCartBadgeCount(1);

    // Add Sauce Labs Bike Light to the cart
    await page.addBikeLightToCart();
    await page.verifyCartBadgeCount(2);

    // Remove Sauce Labs Bike Light from the cart
    await page.removeBikeLightFromCart();
    await page.verifyCartBadgeCount(1);
  });
});
