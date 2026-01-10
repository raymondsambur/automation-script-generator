import { Page } from '@playwright/test';
import { SmartActions } from '../actions/smart-actions';

export class LoginPage {
    private smart: SmartActions;

    constructor(public page: Page) {
        this.smart = new SmartActions(page);
    }

    async navigate() {
        await this.page.goto('https://www.saucedemo.com/');
    }

    async performLogin(user: string, pass: string) {
        // We use specific selectors for SauceDemo
        // Note: The second argument is the 'Text Hint' for self-healing

        // 1. Username Field
        await this.smart.smartClick('[data-test="username"]', 'Username');
        await this.page.fill('[data-test="username"]', user);

        // 2. Password Field
        await this.smart.smartClick('[data-test="password"]', 'Password');
        await this.page.fill('[data-test="password"]', pass);

        // 3. Login Button
        await this.smart.smartClick('[data-test="login-button"]', 'Login');
    }
}