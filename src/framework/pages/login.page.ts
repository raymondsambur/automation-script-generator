import { Page } from '@playwright/test';
import { SmartActions } from '../actions/smart-actions';

export class LoginPage {
    private smart: SmartActions;

    constructor(public page: Page) {
        this.smart = new SmartActions(page);
    }

    async navigate() {
        await this.page.goto('/login');
    }

    async enterEmail(email: string) {
        // The AI will learn to use this pattern
        await this.smart.smartClick('input[name="email"]', 'Email Address');
        await this.page.fill('input[name="email"]', email);
    }

    async clickSignIn() {
        await this.smart.smartClick('button[type="submit"]', 'Sign In');
    }
}