import { test, expect } from '@playwright/test';
import { LoginPage } from '../../framework/pages/authentication.page';
import { TC_1_Data } from './data/TC_1.data';

test.describe('TC-1: Verify User Login', () => {
  let page: LoginPage;

  test.beforeEach(async ({ page: browserPage }) => {
    page = new LoginPage(browserPage);
  });

  test('TC-1: Verify User Login', async () => {
    // Step 1: Navigate to the login page
    await page.navigateToLoginPage(TC_1_Data.url);

    // Step 2-3: Enter the username
    await page.enterUsername(TC_1_Data.username);

    // Step 4-5: Enter the password
    await page.enterPassword(TC_1_Data.password);

    // Step 6: Click the login button
    await page.clickLoginButton();

    // Step 7: Wait for the dashboard page (Products Page)
    await page.waitForProductsPage();

    // Expected Result 1: Verify the URL contains /inventory.html (Dashboard)
    const currentUrl = page.page.url();
    expect(currentUrl).toContain('/inventory.html');

    // Expected Result 2: Verify the "Products" header is visible
    await page.verifyProductsHeader(TC_1_Data.expectedHeader);
  });
});
