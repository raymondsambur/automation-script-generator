import { Page, test } from '@playwright/test';

export class SmartActions {
    readonly page: Page;
    private selectors: Record<string, string> = {};

    constructor(page: Page, selectors?: Record<string, string>) {
        this.page = page;
        if (selectors) {
            this.selectors = selectors;
        }
    }

    /**
     * Smart Click with Self-Healing
     * @param selector The primary CSS/XPath selector
     * @param textHint The text content to fallback to if selector fails
     * @param key Optional key to lookup raw selector data from Notion
     */
    async smartClick(selector: string, textHint?: string, key?: string): Promise<void> {
        try {
            // Step A: Try native click with short timeout
            await this.page.click(selector, { timeout: 2000 });
        } catch (error) {
            // Step B: Log healing
            console.warn(`[HEALING] Selector failed: ${selector}. Initiating fallback...`);

            let healed = false;

            // Strategy 1: Notion Selector Data (if key provided)
            if (key && this.selectors[key]) {
                const candidates = this.generateCandidates(this.selectors[key]);
                for (const candidate of candidates) {
                    try {
                        console.log(`[HEALING] Trying Notion candidate: ${candidate}`);
                        await this.page.click(candidate, { timeout: 1000 });
                        healed = true;
                        test.info().annotations.push({
                            type: 'Self-Healing (Notion Data)',
                            description: `Original '${selector}' failed. Healed using Notion data: "${candidate}".`
                        });
                        return;
                    } catch (e) {
                        // Continue to next candidate
                    }
                }
            }

            // Strategy 2: Text Hint
            if (!healed && textHint) {
                try {
                    // Step C: Fallback to text
                    await this.page.getByText(textHint, { exact: false }).click(); // exact: false is usually safer for loose matches, or we can make it strict.

                    // Step D: Log to Allure (using Playwright annotations which appear in Allure)
                    test.info().annotations.push({
                        type: 'Broken Locator Warning',
                        description: `Original selector '${selector}' failed. Healed using text hint: "${textHint}".`
                    });
                    return;
                } catch (e) {
                    // fall through
                }
            }

            // If all matched failed
            throw error;
        }
    }

    /**
     * Smart Fill (Input) with Self-Healing
     * @param selector The primary selector
     * @param value The value to fill
     * @param textHint The label or placeholder text to fallback to
     * @param key Optional key to lookup raw selector data from Notion
     */
    async smartFill(selector: string, value: string, textHint?: string, key?: string): Promise<void> {
        try {
            await this.page.fill(selector, value, { timeout: 2000 });
        } catch (error) {
            console.warn(`[HEALING] Selector failed: ${selector}. Initiating fallback...`);

            let healed = false;

            // Strategy 1: Notion Selector Data (if key provided)
            if (key && this.selectors[key]) {
                const candidates = this.generateCandidates(this.selectors[key]);
                for (const candidate of candidates) {
                    try {
                        console.log(`[HEALING] Trying Notion candidate: ${candidate}`);
                        await this.page.fill(candidate, value, { timeout: 1000 });
                        healed = true;
                        test.info().annotations.push({
                            type: 'Self-Healing (Notion Data)',
                            description: `Original '${selector}' failed. Healed using Notion data: "${candidate}".`
                        });
                        return;
                    } catch (e) {
                        // Continue
                    }
                }
            }

            if (!healed && textHint) {
                // Try to find input by placeholder or label
                try {
                    await this.page.getByRole('textbox', { name: textHint }).fill(value);
                    test.info().annotations.push({
                        type: 'Broken Locator Warning',
                        description: `Original selector '${selector}' failed. Healed using role hint: "${textHint}".`
                    });
                    return;
                } catch (fallbackError) {
                    // If role search fails, maybe it's a placeholder?
                    try {
                        await this.page.getByPlaceholder(textHint).fill(value);
                        test.info().annotations.push({
                            type: 'Broken Locator Warning',
                            description: `Original selector '${selector}' failed. Healed using placeholder hint: "${textHint}".`
                        });
                        return;
                    } catch (e) {
                        // fall through
                    }
                }
            }

            throw error;
        }
    }

    private generateCandidates(htmlString: string): string[] {
        const candidates: string[] = [];

        // Extract ID
        const idMatch = htmlString.match(/id=["']([^"']+)["']/);
        if (idMatch) candidates.push(`#${idMatch[1]}`);

        // Extract data-test
        const dataTestMatch = htmlString.match(/data-test=["']([^"']+)["']/);
        if (dataTestMatch) candidates.push(`[data-test="${dataTestMatch[1]}"]`);

        // Extract name
        const nameMatch = htmlString.match(/name=["']([^"']+)["']/);
        if (nameMatch) candidates.push(`[name="${nameMatch[1]}"]`);

        // Extract placeholder
        const placeholderMatch = htmlString.match(/placeholder=["']([^"']+)["']/);
        if (placeholderMatch) candidates.push(`[placeholder="${placeholderMatch[1]}"]`);

        return candidates;
    }

    /**
     * Smart Wait For Visibility with Self-Healing
     * @param selector The primary selector
     * @param textHint The text hint
     * @param key Optional key to lookup raw selector data from Notion
     */
    async smartWaitForVisibility(selector: string, textHint?: string, key?: string): Promise<void> {
        try {
            await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
        } catch (error) {
            console.warn(`[HEALING] Selector failed to become visible: ${selector}. Initiating fallback...`);
            let healed = false;

            // Strategy 1: Notion Selector Data (if key provided)
            if (key && this.selectors[key]) {
                const candidates = this.generateCandidates(this.selectors[key]);
                for (const candidate of candidates) {
                    try {
                        console.log(`[HEALING] Trying Notion candidate for visibility: ${candidate}`);
                        await this.page.waitForSelector(candidate, { state: 'visible', timeout: 2000 });
                        healed = true;
                        test.info().annotations.push({
                            type: 'Self-Healing (Notion Data)',
                            description: `Original '${selector}' failed visibility. Healed using Notion data: "${candidate}".`
                        });
                        return;
                    } catch (e) {
                        // Continue
                    }
                }
            }

            if (!healed && textHint) {
                try {
                    // Fallback to text visibility
                    await this.page.getByText(textHint).waitFor({ state: 'visible', timeout: 2000 });
                    test.info().annotations.push({
                        type: 'Broken Locator Warning',
                        description: `Original selector '${selector}' failed visibility. Healed using text hint: "${textHint}".`
                    });
                    return;
                } catch (e) {
                    // fall through
                }
            }

            throw error;
        }
    }

    /**
 * Smart Wait For URL Contains
 * @param urlPart The part of the URL to check for
 * @param context Context message
 * @param key Optional key
 */
    async smartWaitForUrlContains(urlPart: string, context?: string, key?: string): Promise<void> {
        // URL checks typically don't fail due to selectors, but due to logic. 
        // We can just wrap the native wait to keep the API consistent.
        try {
            await this.page.waitForURL(`**/*${urlPart}*`, { timeout: 10000 });
        } catch (error) {
            console.warn(`[SMART] Failed to wait for URL containing: ${urlPart}`);
            throw error;
        }
    }
}
