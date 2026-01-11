import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { TestTicket } from './fetcher';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key_if_missing' });

const openRouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'dummy_key',
});
const OR_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'; // Validated free model

export async function generatePageObject(ticket: TestTicket, existingPageCode: string): Promise<string> {
    const systemInstruction = `You are an expert Senior SDET and Automation Architect specializing in Playwright, TypeScript, and the Page Object Model (POM).

**Your Goal:**
Generate or Update a strictly typed, executable Playwright Page Object file (.ts) based on the provided "Test Ticket" and "Existing Page Code".

**Rules & Guidelines:**
1.  **Strict TypeScript:** Use strict types. No 'any'.
2.  **Imports:**
    *   **CRITICAL:** ALWAYS import \`Page\` from \`@playwright/test\`. DO NOT use 'playwright'.
    *   **CRITICAL:** Import \`SmartActions\` from \`../actions/smart-actions\`.
3.  **Selectors Property (Raw Data):**
    *   Define a private property \`private selectors: Record<string, string> = { ... };\` inside the class.
    *   Populate it with the **RAW HTML STRINGS** directly from the ticket's "Selectors" map. DO NOT modify them. We need the full HTML for self-healing.
4.  **Constructor:**
    *   Standard constructor: \`constructor(public page: Page) { this.smart = new SmartActions(page, this.selectors); }\`.
    *   DO NOT accept selectors as an argument in the constructor key.
5.  **SmartActions Usage:**
    *   The Page Object MUST strictly follow the pattern:
        \`\`\`typescript
        export class MyPage {
             private smart: SmartActions;
             // HTML strings for healing
             private selectors: Record<string, string> = {
                 username_field: '<input id="user-name" ...>',
                 ...
             };

             constructor(public page: Page) {
                 this.smart = new SmartActions(page, this.selectors);
             }
        \`\`\`
    *   Use \`this.smart.smartClick(selector, hint, key)\`, \`this.smart.smartFill(selector, value, hint, key)\`, \`this.smart.smartWaitForVisibility(selector, hint, key)\`.
6.  **Methods & Primary Selectors:**
    *   For each interaction method, YOU must determine the BEST CSS selector to use as the primary strategy.
    *   Analyze the HTML in the ticket to derive it (e.g. \`[data-test="username"]\`, \`#user-name\`).
    *   Define it as a const inside the method or pass it directly.
    *   Example: \`await this.smart.smartFill('[data-test="username"]', username, 'username field', 'username_field');\`
    *   **DO NOT** use \`this.selectors.key\` as the first argument, because that contains HTML! Pass the *derived CSS selector* string.
    *   Pass the \`key\` (e.g. 'username_field') as the last argument so SmartActions can look up the HTML in \`this.selectors\`.
7.  **Conflict Resolution & Updates:**
    *   Analyze the "Existing Page Code".
    *   **Reuse** existing methods if they perform the same action.
    *   **Merge** new selectors into the \`selectors\` property.
    *   **Update** existing methods if they are similar but need slight modification.
    *   **Add** new methods only for new steps.
8.  **No Markdown:** Return PURE CODE. Do not wrap in \`\`\`typescript blocks.

**Input Data:**
*   **Ticket:** JSON object containing steps and selectors.
*   **Existing Page Code:** Source code of the current file (empty string if new).

**Output:**
The complete, updated Page Object source code.
`;

    const prompt = `
TEST TICKET:
${JSON.stringify(ticket, null, 2)}

EXISTING PAGE CODE:
${existingPageCode}

Generate the Page Object Code now.
`;

    try {
        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemInstruction + "\n" + prompt }] }
            ]
        });
        return result.response.text();
    } catch (e) {
        console.error("Gemini failed for Page Object:", e);
        console.log("Falling back to Groq...");

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
            });

            return completion.choices[0]?.message?.content || "";
        } catch (groqError) {
            console.error("Groq fallback failed:", groqError);
            console.log("Falling back to OpenRouter (DeepSeek)...");

            try {
                const completion = await openRouter.chat.completions.create({
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: prompt }
                    ],
                    model: OR_MODEL,
                    temperature: 0.1,
                });
                return completion.choices[0]?.message?.content || "";
            } catch (orError) {
                console.error("OpenRouter fallback failed:", orError);
                throw orError;
            }
        }
    }
}

export async function generateTestData(ticket: TestTicket, existingData: string): Promise<string> {
    const systemInstruction = `You are an expert Senior SDET.

**Your Goal:**
Update or Generate a strictly typed TypeScript data file that acts as a SHARED data source for all tests in this module.

**Rules:**
1.  **Efficiency:** Reuse existing variables (e.g. \`standard_user\`) if the values match. Do not create duplicate variables with the same values.
2.  **Additions:** Add new exported constants or properties to existing objects ONLY if the ticket requires data not present in the existing file.
3.  **STRICT CONTENT:** The file must **ONLY** contain:
    *   Test Data values (users, items, inputs).
    *   Expected Result strings/objects.
    *   **ABSOLUTELY NO** \`selectors\` object.
    *   **ABSOLUTELY NO** \`steps\` object.
    *   **ABSOLUTELY NO** \`prerequisites\` object.
4.  **Naming:** Use descriptive variable names (e.g. \`standardUser\`, \`inventoryItems\`).
5.  **Format:** Return the **ENTIRE** updated file content. It must include all previous data + new data.
6.  **Strict Types:** No 'any'.
7.  **No Markdown:** Return PURE CODE.

**Input:**
*   Ticket IO: \`testData\` and \`expectedResult\` ONLY.
*   Existing File Content.

**Output:**
The COMPLETE, valid TypeScript Source Code for the shared data file.
`;

    const prompt = `
TEST TICKET:
${JSON.stringify(ticket, null, 2)}

EXISTING SHARED DATA FILE:
${existingData || "// Empty file"}

Generate the merged/updated Test Data file content.
`;

    try {
        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemInstruction + "\n" + prompt }] }
            ]
        });
        return result.response.text();
    } catch (error) {
        console.error("Gemini failed for Test Data:", error);

        try {
            const completion = await openRouter.chat.completions.create({
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ],
                model: OR_MODEL, // Deepseek/Llama
                temperature: 0.1,
            });
            return completion.choices[0]?.message?.content || "";

        } catch (orError) {
            console.error("All LLMs failed for Test Data:", orError);
            // Fallback: Append to existing if possible, or just return basic
            return existingData + `\n// Fallback: \nexport const ${ticket.id.replace(/-/g, '_')}_Data = ${JSON.stringify({ ...ticket.testData, ...ticket.expectedResult }, null, 2)};`;
        }
    }
}

export async function generateTestCode(ticket: TestTicket, pageObjectContext: string, dataImportPath: string, dataFileContent: string, pageImportPath: string): Promise<string> {
    const systemInstruction = `You are an expert Senior SDET.

**Your Goal:**
Generate a strictly typed, executable Playwright test file (.spec.ts).

**Rules:**
1.  **Imports:**
    *   Import \`test\`, \`expect\` from \`@playwright/test\`.
    *   Import Page Objects from \`${pageImportPath}\`.
    *   **Import Data:** Import the necessary data constants from \`${dataImportPath}\`.
        *   Look at the "SHARED DATA FILE CONTENT" to see what is exported.
        *   Example: \`import { standardUser, inventoryItems } from '${dataImportPath}';\`
2.  **Page Object Usage:**
    *   Instantiate: \`const myPage = new MyPage(page);\`.
    *   Do NOT pass selectors.
3.  **Structure:** \`test.describe\` -> \`test.beforeEach\` -> \`test\`.
4.  **No Markdown:** Return PURE CODE.

**Input:**
*   Ticket JSON.
*   Page Object Context (Class definition).
*   Shared Data File Content (Exports).

**Output:**
Runnable .spec.ts file.
`;

    const prompt = `
TEST TICKET:
${JSON.stringify(ticket, null, 2)}

EXISTING PAGE OBJECTS (Context):
${pageObjectContext}

SHARED DATA FILE CONTENT (Exports):
${dataFileContent}

DATA IMPORT PATH: ${dataImportPath}
PAGE IMPORT PATH: ${pageImportPath}

Generate the Playwright Test Code now.
`;

    try {
        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemInstruction + "\n" + prompt }] }
            ]
        });

        return result.response.text();
    } catch (error) {
        console.error("Gemini failed for Test Code:", error);
        console.log("Falling back to Groq...");

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
            });

            return completion.choices[0]?.message?.content || "";
        } catch (groqError) {
            console.error("Groq fallback failed:", groqError);
            console.log("Falling back to OpenRouter (DeepSeek)...");

            try {
                const completion = await openRouter.chat.completions.create({
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: prompt }
                    ],
                    model: OR_MODEL,
                    temperature: 0.1,
                });
                return completion.choices[0]?.message?.content || "";
            } catch (orError) {
                console.error("All LLMs failed for Test Code:", orError);
                throw orError;
            }
        }
    }
}
