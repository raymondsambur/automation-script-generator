import { test, expect } from '@playwright/test';
import { SauceDemoProductsPage } from '../../framework/pages/title.page';
import { testData, selectors, prerequisites, steps, expectedResult } from './title.data';

test.describe('SauceDemo - Product Details Page Opens', () => {
  let sauceDemoProductsPage: SauceDemoProductsPage;

  test.beforeEach(async ({ page }) => {
    sauceDemoProductsPage = new SauceDemoProductsPage(page);
    await sauceDemoProductsPage.login(testData.standardUser.username, testData.standardUser.password);
    await sauceDemoProductsPage.verifyProductsPage();
  });

  test('should navigate to product details page', async () => {
    await sauceDemoProductsPage.navigateToProductDetailsPage(testData.inventoryItems.backpack);
    await sauceDemoProductsPage.verifyProductDetailsPage();
    const currentUrl = await sauceDemoProductsPage.page.url();
    expect(currentUrl).toContain('/inventory-item.html');
    await sauceDemoProductsPage.verifyProductDetailsPageVisibility();
  });
});
