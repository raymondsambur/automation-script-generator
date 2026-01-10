import { Page } from '@playwright/test';
import { SmartActions } from '../actions/smart-actions';

export class LoginPage {
  private selectors: Record<string, string> = {
    username_field: '<input class="input_error form_input" placeholder="Username" type="text" data-test="username" id="user-name" name="user-name" autocorrect="off" autocapitalize="none" value="">',
    password_field: '<input class="input_error form_input" placeholder="Password" type="password" data-test="password" id="password" name="password" autocorrect="off" autocapitalize="none" value="">',
    login_button: '<input type="submit" class="submit-button btn_action" data-test="login-button" id="login-button" name="login-button" value="Login">',
    products_header: '<span class="title" data-test="title">Products</span>'
  };

  private smart: SmartActions;

  constructor(public page: Page) {
    this.smart = new SmartActions(page, this.selectors);
  }

  async navigateToLoginPage(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async enterUsername(username: string): Promise<void> {
    const usernameSelector = '[data-test="username"]';
    await this.smart.smartFill(usernameSelector, username, 'username field', 'username_field');
  }

  async enterPassword(password: string): Promise<void> {
    const passwordSelector = '[data-test="password"]';
    await this.smart.smartFill(passwordSelector, password, 'password field', 'password_field');
  }

  async clickLoginButton(): Promise<void> {
    const loginButtonSelector = '[data-test="login-button"]';
    await this.smart.smartClick(loginButtonSelector, 'login button', 'login_button');
  }

  async waitForProductsPage(): Promise<void> {
    await this.page.waitForURL('**/inventory.html');
  }

  async verifyProductsHeader(expectedHeader: string): Promise<void> {
    const productsHeaderSelector = '[data-test="title"]';
    await this.smart.smartWaitForVisibility(productsHeaderSelector, 'products header', 'products_header');
    const headerText = await this.page.textContent(productsHeaderSelector);
    if (headerText !== expectedHeader) {
      throw new Error(`Expected header text to be "${expectedHeader}", but got "${headerText}"`);
    }
  }
}
