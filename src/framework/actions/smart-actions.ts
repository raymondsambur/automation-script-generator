import { Page, test } from '@playwright/test';

export class SmartActions {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Smart Click with Self-Healing
     * @param selector The primary CSS/XPath selector
     * @param textHint The text content to fallback to if selector fails
     */
    async smartClick(selector: string, textHint?: string): Promise<void> {
        try {
            // Step A: Try native click with short timeout
            await this.page.click(selector, { timeout: 2000 });
        } catch (error) {
            // Step B: Log healing
            console.warn(`[HEALING] Selector failed: ${selector}. Initiating fallback...`);

            if (textHint) {
                // Step C: Fallback to text
                await this.page.getByText(textHint, { exact: false }).click(); // exact: false is usually safer for loose matches, or we can make it strict.

                // Step D: Log to Allure (using Playwright annotations which appear in Allure)
                // We use 'issue' or custom type to flag this.
                test.info().annotations.push({
                    type: 'Broken Locator Warning',
                    description: `Original selector '${selector}' failed. Healed using text hint: "${textHint}".`
                });
            } else {
                // No hint provided, rethrow the original error
                throw error;
            }
        }
    }

    /**
     * Smart Fill (Input) with Self-Healing
     * @param selector The primary selector
     * @param value The value to fill
     * @param textHint The label or placeholder text to fallback to
     */
    async smartFill(selector: string, value: string, textHint?: string): Promise<void> {
        try {
            await this.page.fill(selector, value, { timeout: 2000 });
        } catch (error) {
            console.warn(`[HEALING] Selector failed: ${selector}. Initiating fallback...`);

            if (textHint) {
                // Try to find input by placeholder or label
                // This is a bit complex as getByText might point to a label, we need the input.
                // For now, let's try getByPlaceholder or getByLabel logic if we assume textHint is one of those.
                // Or we can try getByRole('textbox', { name: textHint })

                try {
                    await this.page.getByRole('textbox', { name: textHint }).fill(value);
                } catch (fallbackError) {
                    // If role search fails, maybe it's a placeholder?
                    await this.page.getByPlaceholder(textHint).fill(value);
                }

                test.info().annotations.push({
                    type: 'Broken Locator Warning',
                    description: `Original selector '${selector}' failed. Healed using hint: "${textHint}".`
                });
            } else {
                throw error;
            }
        }
    }
}
