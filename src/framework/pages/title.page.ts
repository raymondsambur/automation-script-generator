import { Page } from '@playwright/test';
import { SmartActions } from '../actions/smart-actions';

export class SauceDemoCheckoutPage {
  private selectors: Record<string, string> = {
    cart_badge: '.shopping_cart_badge',
    add_backpack: '#add-to-cart-sauce-labs-backpack',
    add_bike_light: '#add-to-cart-sauce-labs-bike-light',
    remove_bike_light: '#remove-sauce-labs-bike-light',
    remove_backpack: '#remove-sauce-labs-backpack',
    username_field: 'input[id="user-name"]',
    password_field: 'input[id="password"]',
    login_button: 'input[id="login-button"]',
    item_name_link: '.inventory_item_name',
    details_item_name: '.inventory_details_name',
    details_desc: '.inventory_details_desc',
    details_add_to_cart: 'button.btn_primary.btn_small.btn_inventory',
    cart_link: '.shopping_cart_link',
    cart_item_name: '.inventory_item_name',
    cart_item_qty: '.cart_quantity',
    back_to_products: '[data-test="back-to-products"]',
    page_header: '.title',
    sort_dropdown: '[data-test="product_sort_container"]',
    item_price: '.inventory_item_price',
    checkout: '#checkout',
    first_name: '#first-name',
    last_name: '#last-name',
    postal_code: '#postal-code',
    continue: '#continue',
    error_message: '[data-test="error"]',
  };

  private smart: SmartActions;

  constructor(public page: Page) {
    this.smart = new SmartActions(page, this.selectors);
  }

  async login(username: string, password: string): Promise<void> {
    await this.smart.smartFill('input[id="user-name"]', username, 'Username field', 'username_field');
    await this.smart.smartFill('input[id="password"]', password, 'Password field', 'password_field');
    await this.smart.smartClick('input[id="login-button"]', 'Login button', 'login_button');
  }

  async addBackpackToCart(): Promise<void> {
    await this.smart.smartClick('#add-to-cart-sauce-labs-backpack', 'Add to cart button for Sauce Labs Backpack', 'add_backpack');
  }

  async addBikeLightToCart(): Promise<void> {
    await this.smart.smartClick('#add-to-cart-sauce-labs-bike-light', 'Add to cart button for Sauce Labs Bike Light', 'add_bike_light');
  }

  async removeBikeLightFromCart(): Promise<void> {
    await this.smart.smartClick('#remove-sauce-labs-bike-light', 'Remove button for Sauce Labs Bike Light', 'remove_bike_light');
  }

  async removeBackpackFromCart(): Promise<void> {
    await this.smart.smartClick('#remove-sauce-labs-backpack', 'Remove button for Sauce Labs Backpack', 'remove_backpack');
  }

  async verifyCartBadgeCount(expectedCount: number): Promise<void> {
    await this.smart.smartWaitForVisibility('.shopping_cart_badge', `Cart badge with count ${expectedCount}`, 'cart_badge');
    const badgeText = await this.page.textContent('.shopping_cart_badge');
    if (badgeText!== `${expectedCount}`) {
      throw new Error(`Expected cart badge count to be ${expectedCount}, but got ${badgeText}`);
    }
  }

  async navigateToProductDetailsPage(itemName: string): Promise<void> {
    await this.smart.smartClick(`.inventory_item_name`, `Product name ${itemName}`, 'item_name_link');
  }

  async verifyProductDetailsPage(): Promise<void> {
    await this.smart.smartWaitForVisibility('.inventory_details_name', 'Item name on details page', 'details_item_name');
    await this.smart.smartWaitForVisibility('.inventory_details_desc', 'Item description on details page', 'details_desc');
    await this.smart.smartWaitForVisibility('button.btn_primary.btn_small.btn_inventory', 'Add to cart button on details page', 'details_add_to_cart');
  }

  async openCart(): Promise<void> {
    await this.smart.smartClick('.shopping_cart_link', 'Cart link', 'cart_link');
  }

  async verifyCartItemName(itemName: string): Promise<void> {
    await this.smart.smartWaitForVisibility('.inventory_item_name', `Item name ${itemName}`, 'cart_item_name');
  }

  async verifyCartItemQuantity(itemName: string, expectedQuantity: number): Promise<void> {
    await this.smart.smartWaitForVisibility('.cart_quantity', `Item quantity ${itemName}`, 'cart_item_qty');
    const quantityText = await this.page.textContent('.cart_quantity');
    if (quantityText!== `${expectedQuantity}`) {
      throw new Error(`Expected item quantity to be ${expectedQuantity}, but got ${quantityText}`);
    }
  }

  async navigateBackToProducts(): Promise<void> {
    await this.smart.smartClick('[data-test="back-to-products"]', 'Back to products button', 'back_to_products');
  }

  async verifyProductsPage(): Promise<void> {
    await this.smart.smartWaitForVisibility('.title', 'Products page header', 'page_header');
  }

  async sortProductsByPriceLowToHigh(): Promise<void> {
    await this.smart.smartClick('[data-test="product_sort_container"]', 'Sort dropdown', 'sort_dropdown');
    await this.smart.smartClick('option[value="lohi"]', 'Price (low to high) option', 'sort_dropdown');
  }

  async getProductPrices(): Promise<string[]> {
    const prices = await this.page.$$eval('.inventory_item_price', (elements) => elements.map((element) => element.textContent));
    return prices;
  }

  async verifyProductPricesAreSorted(): Promise<void> {
    const prices = await this.getProductPrices();
    const numericPrices = prices.map((price) => parseFloat(price.replace('$', '')));
    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    if (JSON.stringify(numericPrices)!== JSON.stringify(sortedPrices)) {
      throw new Error('Product prices are not sorted in ascending order');
    }
  }

  async checkout(): Promise<void> {
    await this.smart.smartClick('#checkout', 'Checkout button', 'checkout');
  }

  async enterCheckoutInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.smart.smartFill('#first-name', firstName, 'First name field', 'first_name');
    await this.smart.smartFill('#last-name', lastName, 'Last name field', 'last_name');
    await this.smart.smartFill('#postal-code', postalCode, 'Postal code field', 'postal_code');
  }

  async continueCheckout(): Promise<void> {
    await this.smart.smartClick('#continue', 'Continue button', 'continue');
  }

  async verifyErrorMessage(): Promise<void> {
    await this.smart.smartWaitForVisibility('[data-test="error"]', 'Error message', 'error_message');
  }

  async navigateToProductDetailsPageUsingItemName(itemName: string): Promise<void> {
    await this.smart.smartClick(`.inventory_item_name`, `Product name ${itemName}`, 'item_name_link');
  }

  async verifyProductDetailsPageVisibility(): Promise<void> {
    await this.smart.smartWaitForVisibility('.inventory_details_name', 'Item name on details page', 'details_item_name');
    await this.smart.smartWaitForVisibility('.inventory_details_desc', 'Item description on details page', 'details_desc');
    await this.smart.smartWaitForVisibility('button.btn_primary.btn_small.btn_inventory', 'Add to cart button on details page', 'details_add_to_cart');
  }
}
