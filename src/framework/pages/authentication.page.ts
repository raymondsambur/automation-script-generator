import { Page } from '@playwright/test';
import { SmartActions } from '../actions/smart-actions';

export class SauceDemoPage {
  private smart: SmartActions;
  private selectors: Record<string, string> = {
    username_field: '<input class="input_error form_input" placeholder="Username" type="text" data-test="username" id="user-name" name="user-name" autocorrect="off" autocapitalize="none" value="">',
    password_field: '<input class="input_error form_input" placeholder="Password" type="password" data-test="password" id="password" name="password" autocorrect="off" autocapitalize="none" value="">',
    login_button: '<input type="submit" class="submit-button btn_action" data-test="login-button" id="login-button" name="login-button" value="Login">',
    error_message: '<div data-test="error" role="alert" class="error-message-container error-message-close">Epic sadface: Username is required</div>',
    menu_button: '#react-burger-menu-btn',
    logout_link: '#logout_sidebar_link',
    products_header: '<span class="title" data-test="title">Products</span>',
  };

  constructor(public page: Page) {
    this.smart = new SmartActions(page, this.selectors);
  }

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async enterUsername(username: string): Promise<void> {
    const usernameSelector = '[data-test="username"]';
    await this.smart.smartFill(usernameSelector, username, 'username field', 'username_field');
  }

  async enterPassword(password: string): Promise<void> {
    const passwordSelector = '[data-test="password"]';
    await this.smart.smartFill(passwordSelector, password, 'password field', 'password_field');
  }

  async clickLogin(): Promise<void> {
    const loginButtonSelector = '[data-test="login-button"]';
    await this.smart.smartClick(loginButtonSelector, 'login button', 'login_button');
  }

  async waitForErrorMessage(): Promise<void> {
    const errorSelector = '[data-test="error"]';
    await this.smart.smartWaitForVisibility(errorSelector, 'error message', 'error_message');
  }

  async waitForWelcomeHeader(expectedHeader: string): Promise<void> {
    const headerSelector = 'h1';
    await this.smart.smartWaitForVisibility(headerSelector, 'welcome header', '');
    const headerText = await this.page.textContent(headerSelector);
    if (headerText!== expectedHeader) {
      throw new Error(`Expected header text to be '${expectedHeader}' but got '${headerText}'`);
    }
  }

  async verifySessionToken(): Promise<void> {
    const storage = await this.page.context().storage();
    const sessionToken = await storage.getState().cookies.find((cookie) => cookie.name === 'sessionToken');
    if (!sessionToken) {
      throw new Error('Session token not found in LocalStorage');
    }
  }

  async verifyUrlContainsDashboard(): Promise<void> {
    const currentUrl = await this.page.url();
    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`Expected URL to contain '/dashboard' but got '${currentUrl}'`);
    }
  }

  async clickMenuButton(): Promise<void> {
    const menuButtonSelector = '#react-burger-menu-btn';
    await this.smart.smartClick(menuButtonSelector, 'menu button', 'menu_button');
  }

  async clickLogoutLink(): Promise<void> {
    const logoutLinkSelector = '#logout_sidebar_link';
    await this.smart.smartClick(logoutLinkSelector, 'logout link', 'logout_link');
  }

  async verifyLoginButtonIsVisible(): Promise<void> {
    const loginButtonSelector = '[data-test="login-button"]';
    await this.smart.smartWaitForVisibility(loginButtonSelector, 'login button', 'login_button');
  }

  async logout(): Promise<void> {
    await this.clickMenuButton();
    await this.clickLogoutLink();
    await this.verifyLoginButtonIsVisible();
  }

  async validateEmptyUsernameLogin(): Promise<void> {
    await this.navigateToLoginPage();
    await this.enterUsername('');
    await this.enterPassword('secret_sauce');
    await this.clickLogin();
    await this.waitForErrorMessage();
    const currentUrl = await this.page.url();
    if (currentUrl!== 'https://www.saucedemo.com/') {
      throw new Error(`Expected URL to be 'https://www.saucedemo.com/' but got '${currentUrl}'`);
    }
  }

  async loginWithValidCredentials(username: string, password: string): Promise<void> {
    await this.navigateToLoginPage();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async waitForProductsHeader(): Promise<void> {
    const productsHeaderSelector = '[data-test="title"]';
    await this.smart.smartWaitForVisibility(productsHeaderSelector, 'products header', 'products_header');
  }

  async verifyUrlContainsInventory(): Promise<void> {
    const currentUrl = await this.page.url();
    if (!currentUrl.includes('/inventory.html')) {
      throw new Error(`Expected URL to contain '/inventory.html' but got '${currentUrl}'`);
    }
  }

  async loginWithLockedOutUser(username: string, password: string): Promise<void> {
    await this.navigateToLoginPage();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
    await this.waitForErrorMessage();
    const currentUrl = await this.page.url();
    if (currentUrl!== 'https://www.saucedemo.com/') {
      throw new Error(`Expected URL to be 'https://www.saucedemo.com/' but got '${currentUrl}'`);
    }
  }

  async loginAndLogout(username: string, password: string): Promise<void> {
    await this.loginWithValidCredentials(username, password);
    await this.logout();
  }
}
