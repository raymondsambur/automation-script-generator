import { test, expect } from '@playwright/test';
import { SauceDemoLoginPage } from '../../framework/pages/authentication.page';
import { TC_1_Data } from './data/TC_1.data';

test.describe('TC-1: Verify User Login', () => {
  let myPage: SauceDemoLoginPage;

  test.beforeEach(async ({ page }) => {
    myPage = new SauceDemoLoginPage(page);
    await myPage.navigateToLoginPage();
  });

  test('TC-1: Verify User Login', async () => {
    await myPage.enterUsername(TC_1_Data.username);
    await myPage.enterPassword(TC_1_Data.password);
    await myPage.clickLogin();
    await myPage.verifyUrlContainsDashboard();
    await myPage.waitForWelcomeHeader(TC_1_Data.expectedHeader);
    await myPage.verifySessionToken();
  });
});
