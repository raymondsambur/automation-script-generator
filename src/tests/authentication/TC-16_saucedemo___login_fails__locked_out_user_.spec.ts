// FILE: authentication.spec.ts

import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../../framework/pages/authentication.page';
import { lockedOutUser } from './authentication.data';

test.describe('SauceDemo - Login Fails (Locked Out User)', () => {
  let sauceDemoPage: SauceDemoPage;

  test.beforeEach(async ({ page }) => {
    sauceDemoPage = new SauceDemoPage(page);
  });

  test('TC-16: Login fails with locked out user', async () => {
    await sauceDemoPage.navigateToLoginPage();
    await sauceDemoPage.enterUsername(lockedOutUser.username);
    await sauceDemoPage.enterPassword(lockedOutUser.password);
    await sauceDemoPage.clickLogin();
    await sauceDemoPage.waitForErrorMessage();
    const currentUrl = await sauceDemoPage.page.url();
    expect(currentUrl).toBe('https://www.saucedemo.com/');
  });
});
