import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../../framework/pages/title.page';
import { TC_9_Data } from './data/TC_9.data';

test.describe('TC-9: SauceDemo - Add Item to Cart and Checkout (Happy Path)', () => {
  let sauceDemoPage: SauceDemoPage;

  test.beforeEach(async ({ page }) => {
    sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.navigateTo(TC_9_Data.url);
  });

  test('TC-9: SauceDemo - Add Item to Cart and Checkout (Happy Path)', async () => {
    // Step 1: Navigate to https://www.saucedemo.com/
    await sauceDemoPage.navigateTo(TC_9_Data.url);

    // Step 2: Log in using the username and password from the test data
    await sauceDemoPage.login(TC_9_Data.username, TC_9_Data.password);

    // Step 3: On the Products page, click "Add to cart" for Sauce Labs Backpack
    await sauceDemoPage.addToCart(TC_9_Data.itemName);

    // Step 4: Click the cart icon to open the cart page
    await sauceDemoPage.openCart();

    // Expected Result 2: URL Check: Cart URL contains /cart.html
    const cartUrl = await sauceDemoPage.page.url();
    expect(cartUrl).toContain('/cart.html');

    // Step 5: Verify Sauce Labs Backpack is listed in the cart
    const cartItem = await sauceDemoPage.page.textContent('.inventory_item_name');
    expect(cartItem).toContain(TC_9_Data.itemName);

    // Step 6: Click "Checkout"
    await sauceDemoPage.checkout();

    // Step 7: Fill in the checkout form using the test data (First Name, Last Name, Zip/Postal Code)
    await sauceDemoPage.fillCheckoutForm(TC_9_Data.firstName, TC_9_Data.lastName, TC_9_Data.postalCode);

    // Step 8: Click "Continue"
    await sauceDemoPage.continueCheckout();

    // Expected Result 3: Checkout: Checkout info page accepts valid data and proceeds to Overview (/checkout-step-two.html)
    const overviewUrl = await sauceDemoPage.page.url();
    expect(overviewUrl).toContain('/checkout-step-two.html');

    // Step 9: On the Overview page, verify Sauce Labs Backpack is listed
    const overviewItem = await sauceDemoPage.page.textContent('.inventory_item_name');
    expect(overviewItem).toContain(TC_9_Data.itemName);

    // Step 10: Click "Finish"
    await sauceDemoPage.finishCheckout();

    // Expected Result 5: URL Check: Complete page URL contains /checkout-complete.html
    const completeUrl = await sauceDemoPage.page.url();
    expect(completeUrl).toContain('/checkout-complete.html');

    // Expected Result 4: Confirmation: After clicking Finish, confirmation message "Thank you for your order!" is visible
    const confirmationMessage = await sauceDemoPage.verifyConfirmationMessage(TC_9_Data.expectedConfirmation);
    expect(confirmationMessage).toBe(true);
  });
});
