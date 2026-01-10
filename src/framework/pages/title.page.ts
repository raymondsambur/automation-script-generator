import { Page } from '@playwright/test';
import { SmartActions } from '../actions/smart-actions';

export class SauceDemoPage {
    private selectors: Record<string, string> = {
        username_field: '<input class="input_error form_input" placeholder="Username" type="text" data-test="username" id="user-name" name="user-name" autocorrect="off" autocapitalize="none" value="">',
        password_field: '<input class="input_error form_input" placeholder="Password" type="password" data-test="password" id="password" name="password" autocorrect="off" autocapitalize="none" value="">',
        login_button: '<input type="submit" class="submit-button btn_action" data-test="login-button" id="login-button" name="login-button" value="Login">',
        add_to_cart_backpack: '<button class="btn btn_primary btn_small btn_inventory" data-test="add-to-cart-sauce-labs-backpack" id="add-to-cart-sauce-labs-backpack" name="add-to-cart-sauce-labs-backpack">Add to cart</button>',
        cart_link: '<a class="shopping_cart_link" data-test="shopping-cart-link" href="./cart.html"></a>',
        checkout_button: '<button class="btn btn_action btn_medium checkout_button" data-test="checkout" id="checkout" name="checkout">Checkout</button>',
        first_name_field: '<input class="input_error form_input" placeholder="First Name" type="text" data-test="firstName" id="first-name" name="firstName" autocorrect="off" autocapitalize="none" value="">',
        last_name_field: '<input class="input_error form_input" placeholder="Last Name" type="text" data-test="lastName" id="last-name" name="lastName" autocorrect="off" autocapitalize="none" value="">',
        postal_code_field: '<input class="input_error form_input" placeholder="Zip/Postal Code" type="text" data-test="postalCode" id="postal-code" name="postalCode" autocorrect="off" autocapitalize="none" value="">',
        continue_button: '<input type="submit" class="submit-button btn btn_primary cart_button btn_action" data-test="continue" id="continue" name="continue" value="Continue">',
        finish_button: '<button class="btn btn_action btn_medium cart_button" data-test="finish" id="finish" name="finish">Finish</button>',
        complete_header: '<h2 class="complete-header" data-test="complete-header">Thank you for your order!</h2>'
    };

    private smart: SmartActions;

    constructor(public page: Page) {
        this.smart = new SmartActions(page, this.selectors);
    }

    async login(username: string, password: string): Promise<void> {
        await this.smart.smartFill('[data-test="username"]', username, 'username field', 'username_field');
        await this.smart.smartFill('[data-test="password"]', password, 'password field', 'password_field');
        await this.smart.smartClick('[data-test="login-button"]', 'login button', 'login_button');
    }

    async addToCart(itemName: string): Promise<void> {
        await this.smart.smartClick('[data-test="add-to-cart-sauce-labs-backpack"]', `add to cart ${itemName} button`, 'add_to_cart_backpack');
    }

    async openCart(): Promise<void> {
        await this.smart.smartClick('[data-test="shopping-cart-link"]', 'cart link', 'cart_link');
    }

    async checkout(): Promise<void> {
        await this.smart.smartClick('[data-test="checkout"]', 'checkout button', 'checkout_button');
    }

    async fillCheckoutForm(firstName: string, lastName: string, postalCode: string): Promise<void> {
        await this.smart.smartFill('[data-test="firstName"]', firstName, 'first name field', 'first_name_field');
        await this.smart.smartFill('[data-test="lastName"]', lastName, 'last name field', 'last_name_field');
        await this.smart.smartFill('[data-test="postalCode"]', postalCode, 'postal code field', 'postal_code_field');
    }

    async continueCheckout(): Promise<void> {
        await this.smart.smartClick('[data-test="continue"]', 'continue button', 'continue_button');
    }

    async finishCheckout(): Promise<void> {
        await this.smart.smartClick('[data-test="finish"]', 'finish button', 'finish_button');
    }

    async verifyConfirmationMessage(expectedMessage: string): Promise<boolean> {
        const confirmationMessage = await this.page.textContent('[data-test="complete-header"]');
        return confirmationMessage === expectedMessage;
    }

    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url);
    }
}
