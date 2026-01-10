import { test, expect } from '@playwright/test';
import { SauceDemoProductsPage } from '../../framework/pages/title.page';
import { TC_12_Data } from './data/TC_12.data';

test.describe('TC-12 - SauceDemo - Sort Products (Price Low to High)', () => {
  let myPage: SauceDemoProductsPage;

  test.beforeEach(async ({ page }) => {
    myPage = new SauceDemoProductsPage(page);
    await myPage.page.goto(TC_12_Data.url);
    await myPage.login(TC_12_Data.username, TC_12_Data.password);
  });

  test('TC-12 - Sort Products (Price Low to High)', async () => {
    await myPage.sortProductsByPriceLowToHigh();
    await myPage.verifyProductPricesAreSorted();
  });
});
