import { test, expect } from '@playwright/test';
import { SauceDemoProductsPage } from '../../framework/pages/title.page';
import { testData, selectors, prerequisites, steps, expectedResult } from './title.data';

test.describe('SauceDemo - Add Multiple Items to Cart', () => {
  let sauceDemoProductsPage: SauceDemoProductsPage;

  test.beforeEach(async ({ page }) => {
    sauceDemoProductsPage = new SauceDemoProductsPage(page);
    await sauceDemoProductsPage.login(testData.standardUser.username, testData.standardUser.password);
    await sauceDemoProductsPage.verifyProductsPage();
  });

  test('TC-10: Add Multiple Items to Cart', async () => {
    // Step 1: Log in using the username and password from the test data.
    // Already logged in during beforeEach

    // Step 2: Click "Add to cart" for Sauce Labs Backpack.
    await sauceDemoProductsPage.addBackpackToCart();

    // Step 3: Click "Add to cart" for Sauce Labs Bike Light.
    await sauceDemoProductsPage.addBikeLightToCart();

    // Step 4: Click the cart icon to open the cart page.
    await sauceDemoProductsPage.openCart();

    // Expected Result 1: Cart: Both items appear in the cart.
    await sauceDemoProductsPage.verifyCartItemName(testData.inventoryItems.backpack);
    await sauceDemoProductsPage.verifyCartItemName(testData.inventoryItems.bikeLight);

    // Expected Result 2: Quantity: Each item shows quantity 1.
    await sauceDemoProductsPage.verifyCartItemQuantity(testData.inventoryItems.backpack, 1);
    await sauceDemoProductsPage.verifyCartItemQuantity(testData.inventoryItems.bikeLight, 1);

    // Expected Result 3: URL Check: Verify the URL contains /cart.html.
    const currentUrl = await sauceDemoProductsPage.page.url();
    expect(currentUrl).toContain('/cart.html');
  });
});
