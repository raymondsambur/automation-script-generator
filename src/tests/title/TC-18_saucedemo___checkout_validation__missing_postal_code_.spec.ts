import { test, expect } from '@playwright/test';
import { SauceDemoCheckoutPage } from '../../framework/pages/title.page';
import { TC_18_Data } from './data/TC_18.data';

test.describe('TC-18 - SauceDemo - Checkout Validation (Missing Postal Code)', () => {
  let page: SauceDemoCheckoutPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new SauceDemoCheckoutPage(browserPage);
  });

  test('TC-18 - SauceDemo - Checkout Validation (Missing Postal Code)', async () => {
    // Step 1: Log in using the username and password from the test data.
    await page.page.goto(TC_18_Data.url);
    await page.page.fill('#user-name', TC_18_Data.username);
    await page.page.fill('#password', TC_18_Data.password);
    await page.page.click('#login-button');

    // Step 2: Add Sauce Labs Backpack to the cart.
    await page.page.click('#add-to-cart-sauce-labs-backpack');

    // Step 3: Open the cart and click "Checkout".
    await page.page.click('#shopping_cart_container');
    await page.clickCheckout();

    // Step 4: Enter First Name and Last Name.
    await page.fillFirstNameAndLastName(TC_18_Data.firstName, TC_18_Data.lastName);

    // Step 5: Leave Zip/Postal Code empty.
    await page.leavePostalCodeEmpty();

    // Step 6: Click "Continue".
    await page.clickContinue();

    // Expected Result 1: Error: A validation error message is displayed for missing postal code.
    await page.waitForErrorMessage();
    const errorMessage = await page.page.textContent('[data-test="error"]');
    expect(errorMessage).toContain('Error:');

    // Expected Result 2: Navigation: User remains on checkout step one (/checkout-step-one.html).
    const currentUrl = await page.page.url();
    expect(currentUrl).toContain('/checkout-step-one.html');
  });
});
