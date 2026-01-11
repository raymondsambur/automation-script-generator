import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../../framework/pages/authentication.page';
import { standardUser, lockedOutUser, expectedHeaders, urls } from './authentication.data';

test.describe('Sauce Demo Authentication', () => {
  test.beforeEach(async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.navigateToLoginPage();
  });

  test('Verify User Login with Valid Credentials', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.enterUsername(standardUser.username);
    await sauceDemoPage.enterPassword(standardUser.password);
    await sauceDemoPage.clickLogin();
    await sauceDemoPage.waitForWelcomeHeader(expectedHeaders.swagLabsHeader);
    await sauceDemoPage.verifyUrlContainsInventory();
  });

  test('Verify User Login with Locked Out User', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.enterUsername(lockedOutUser.username);
    await sauceDemoPage.enterPassword(lockedOutUser.password);
    await sauceDemoPage.clickLogin();
    await sauceDemoPage.waitForErrorMessage();
  });

  test('Verify User Login with Empty Username', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.enterUsername('');
    await sauceDemoPage.enterPassword(standardUser.password);
    await sauceDemoPage.clickLogin();
    await sauceDemoPage.waitForErrorMessage();
  });

  test('Verify User Login with Empty Password', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.enterUsername(standardUser.username);
    await sauceDemoPage.enterPassword('');
    await sauceDemoPage.clickLogin();
    await sauceDemoPage.waitForErrorMessage();
  });
});
