import { test, expect } from '@playwright/test';
import { LoginPage } from '../../framework/pages/login.page';
import { SmartActions } from '../../framework/actions/smart-actions';

const testData = {
  url: 'https://www.saucedemo.com/',
  username: 'standard_user',
  password: 'secret_sauce',
  expectedHeader: 'Swag Labs'
};

test.describe('TC-1: Verify User Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-1: Verify User Login', async () => {
    await loginPage.performLogin(testData.username, testData.password);

    // Verify URL contains /dashboard
    await expect(page).toHaveURL({ pathname: '/inventory.html' });

    // Verify "Welcome Back" header is visible
    await expect(page.locator('.title')).toContainText(testData.expectedHeader);
  });
});
