import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
import { TestTicket } from './fetcher';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key_if_missing' }); // Ensure it doesn't crash on init if key is missing, validated later

export async function generateTestCode(ticket: TestTicket, pageObjectContext: string): Promise<string> {
    const systemInstruction = `You are an expert Senior SDET and Automation Architect specializing in Playwright, TypeScript, and the Page Object Model (POM).

**Your Goal:**
Generate a strictly typed, executable Playwright test file (.spec.ts) based on the provided "Test Ticket" and "Page Object Context".

**Rules & Guidelines:**
1.  **Strict TypeScript:** Use strict types. No 'any'.
2.  **SmartActions Integration:**
    *   ALL page interaction classes (Page Objects) should already exist in the provided "Page Object Context".
    *   If you instantiate a Page Object, it likely takes 'page' or 'SmartActions' in constructor.
    *   **CRITICAL:** INTERACT with elements via the Page Object methods if available.
    *   If you must interact with the page directly in the test (which should be rare in strict POM), ALWAYS use the \`SmartActions\` wrapper methods (smartClick, smartFill) if the SmartActions class is available and relevant to the context.
    *   *Self-Correction:* If the provided Page Objects use \`Playwright's Page\`, use that. If they use \`SmartActions\`, use that. Adapt to the provided context code.
3.  **Test Structure:**
    *   Use \`test.describe\` with the Ticket Title.
    *   Use \`test\` with the Ticket ID and Title.
    *   Use \`test.beforeEach\` for setup (Prerequisites).
4.  **Data Driven:**
    *   Use the \`testData\` from the ticket. Define it as a const at the top of the test or inside the test block.
5.  **Assertions:**
    *   Implement assertions matching the "Expected Result".
    *   Use \`expect(...)\`.
6.  **No Markdown:** Return PURE CODE. Do not wrap in \`\`\`typescript blocks.
7.  **Imports:**
    *   Import \`test\`, \`expect\` from '@playwright/test'.
    *   Import any Page Objects from the relative path \`../../framework/pages/...\`.

**Input Data:**
*   **Ticket:** JSON object.
*   **Page Objects:** Source code of existing POM files.

**Output:**
A complete, runnable .spec.ts file.
`;

    const prompt = `
TEST TICKET:
${JSON.stringify(ticket, null, 2)}

EXISTING PAGE OBJECTS (Context):
${pageObjectContext}

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
        console.error("Error generating code with Gemini:", error);
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
            console.error("Error generating code with Groq fallback:", groqError);
            throw error; // Throw original Gemini error or maybe the Groq one? Let's throw the original to point to the primary failure, or maybe wrap them. Let's throw the Groq one implies both failed.
        }
    }
}
