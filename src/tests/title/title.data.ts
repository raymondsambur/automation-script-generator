// Shared test data for SauceDemo module
export const testData = {
  url: 'https://www.saucedemo.com/',
  standardUser: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  inventoryItems: {
    backpack: 'Sauce Labs Backpack',
    bikeLight: 'Sauce Labs Bike Light',
  },
  checkout: {
    firstName: 'Raymond',
    lastName: 'Test',
    postalCode: '',
  },
  cartItems: [
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
  ],
};

export const selectors = {
  checkout: '#checkout',
  firstName: '#first-name',
  lastName: '#last-name',
  postalCode: '#postal-code',
  continue: '#continue',
  error_message: '[data-test="error"]',
  cart_badge: '.shopping_cart_badge',
  add_backpack: '#add-to-cart-sauce-labs-backpack',
  add_bike_light: '#add-to-cart-sauce-labs-bike-light',
  remove_bike_light: '#remove-sauce-labs-bike-light',
  item_name_link: '.inventory_item_name',
  details_item_name: '.inventory_details_name',
  details_desc: '.inventory_details_desc',
  details_add_to_cart: 'button.btn_primary.btn_small.btn_inventory',
  cart_link: '.shopping_cart_link',
  cart_item_name: '.inventory_item_name',
  cart_item_qty: '.cart_quantity',
};

export const prerequisites = {
  prerequisites1: 'User can log in to SauceDemo with valid credentials.',
  prerequisites2: 'User is on the Products page (/inventory.html).',
  prerequisites3: 'At least one item is added to the cart.',
};

export const steps = {
  step1: 'Log in using the username and password from the test data.',
  step2: 'Add Sauce Labs Backpack to the cart.',
  step2_alt: 'Click the product name Sauce Labs Backpack.',
  step3: 'Open the cart and click "Checkout".',
  step4: 'Enter First Name and Last Name.',
  step5: 'Leave Zip/Postal Code empty.',
  step6: 'Click "Continue".',
  step7: 'Add Sauce Labs Bike Light to the cart.',
  step8: 'Verify the cart badge shows 2.',
  step9: 'Remove Sauce Labs Bike Light.',
  step10: 'Verify the cart badge shows 1.',
  step11: 'Click "Add to cart" for Sauce Labs Backpack.',
  step12: 'Click "Add to cart" for Sauce Labs Bike Light.',
  step13: 'Click the cart icon to open the cart page.',
};

export const expectedResult = {
  expectedResult1: 'Error: A validation error message is displayed for missing postal code.',
  expectedResult2: 'Navigation: User remains on checkout step one (/checkout-step-one.html).',
  expectedResult3: 'Badge: Cart badge count increments when adding items.',
  expectedResult4: 'Badge: Cart badge count decrements when removing items.',
  expectedResult5: 'Navigation: User is navigated to the product details page.',
  expectedResult6: 'URL Check: URL contains /inventory-item.html.',
  expectedResult7: 'Visibility: Item name and description are visible.',
  expectedResult8: 'Visibility: An "Add to cart" button is visible on the details page.',
  expectedResult9: 'Cart: Both items appear in the cart.',
  expectedResult10: 'Quantity: Each item shows quantity 1.',
  expectedResult11: 'URL Check: Verify the URL contains /cart.html.',
};
