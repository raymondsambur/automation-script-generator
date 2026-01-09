# 🚀 Project Mission: Hybrid AI Automation Framework (Notion -> Playwright)

## 1. Objective
Build an autonomous end-to-end testing framework that:
1.  **Reads** test scenarios from a Notion Database.
2.  **Generates** executable Playwright (TypeScript) scripts automatically using **Google Gemini**.
3.  **Executes** tests with a "Self-Healing" mechanism for resilient locators.
4.  **Reports** results via Allure and updates Notion status.

---

## 2. Antigravity Agent Rules (Configuration)
*Save the content below to `.agent/rules/automation-architect.md` (or equivalent context file) before starting.*

> **Role:** You are a Senior SDET and Automation Architect.
> **Tech Stack:** TypeScript, Node.js (v20+), Playwright, Allure Report, Notion Client SDK, Google GenAI SDK.
> **Principles:**
> * **Strict Types:** All code must be strongly typed (no `any`).
> * **POM Pattern:** All generated tests must strictly follow the Page Object Model (POM).
> * **Gemini First:** Use the `@google/genai` SDK with the `gemini-2.0-flash` model for all code generation.
> * **Heuristic Healing:** Never fail immediately on a missing selector; attempt a fallback strategy first.
> * **Clean Code:** Always run linter/formatter on generated code.

---

## 3. Architecture & Data Flow

### A. Notion Database Schema
The agent must validate that the Notion Database exists with these properties:
* `Test ID` (Number/Formula): Unique ID (e.g., "101").
* `Title` (Title): Name of the test case.
* `Module` (Select): e.g., "Auth", "Checkout".
* `Status` (Status): "To Do", "Ready for Automation", "Automated".
* `Steps` (Text/Markdown): The test steps.
* `Expected Result` (Text): The assertion criteria.
* `Test Data` (Code/JSON): e.g., `{"user": "admin", "pass": "1234"}`.

### B. Directory Structure
```text
/
├── .agent/rules/             # Antigravity context rules
├── config/                   # Configuration files
│   └── notion.config.ts      # Notion API keys and DB IDs
├── src/
│   ├── generator/            # THE BUILDER
│   │   ├── fetcher.ts        # Pulls from Notion
│   │   ├── translator.ts     # Gemini Agent (Notion -> TS Code)
│   │   └── writer.ts         # Saves .spec.ts files
│   ├── framework/            # THE RUNNER
│   │   ├── pages/            # Page Objects (POM)
│   │   └── actions/          # Self-healing wrappers
│   └── tests/                # Generated Spec files live here
├── playwright.config.ts
├── .env                      # Contains GEMINI_API_KEY
└── package.json
```

---

## 4. Implementation Steps (Agent Workflows)

### Phase 1: Foundation & Infrastructure
**Goal:** Initialize project and install dependencies.

1.  **Scaffold Project:**
    * Initialize `package.json`.
    * Install dependencies (Gemini updated):
        ```bash
        npm install playwright @playwright/test allure-playwright @notionhq/client dotenv @google/genai
        npm install --save-dev typescript ts-node @types/node eslint
        ```
    * **Environment Setup:** Create `.env` file and add `GEMINI_API_KEY=your_key_here`.

2.  **Configure Playwright:**
    * Set up `playwright.config.ts` to use `allure-playwright` reporter.
    * Enable `trace: 'on-first-retry'` and `video: 'on-first-retry'`.

### Phase 2: The "Smart" Framework (Self-Healing)
**Goal:** Create the wrapper that prevents flaky tests.

1.  **Create `src/framework/actions/smart-actions.ts`:**
    * Implement a class `SmartPage`.
    * **Function `smartClick(selector: string, textHint?: string)`**:
        * **Step A:** Try `page.click(selector)` with a short timeout (e.g., 2000ms).
        * **Step B:** If it fails, catch the error and log "Healing initiated...".
        * **Step C:** Fallback to `page.getByText(textHint).click()`.
        * **Step D:** Log the healing event to Allure as a "Broken Locator Warning".

### Phase 3: The Generator (Notion Integration)
**Goal:** Fetch data from Notion.

1.  **Create `src/generator/fetcher.ts`:**
    * **Function `getTestCandidates()`**: Query the Notion Database where `Status` property equals "Ready for Automation".
    * **Data Mapping:** Map the raw Notion API response to a clean Interface:
        ```typescript
        interface TestTicket {
            id: string;
            title: string;
            module: string;
            steps: string; // Markdown text
            expectedResult: string;
            testData: any; // Parsed JSON from code block
        }
        ```

### Phase 4: The Translator (Gemini 2.0 Agent)
**Goal:** Convert English to TypeScript using Google Gemini.

1.  **Create `src/generator/translator.ts`:**
    * **Import:** `const { GoogleGenAI } = require('@google/genai');`
    * **Initialize:** `const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });`
    * **Context Loading:** Read `src/framework/pages/*.ts` content.
    * **Prompt Logic:**
        ```typescript
        const systemInstruction = `You are a Playwright code generator.
        1. Read the provided Test Ticket and Page Object definitions.
        2. Output valid TypeScript code for a Playwright test file.
        3. Use 'SmartPage' actions (smartClick, smartFill) instead of native page methods.
        4. Do NOT verify with comments, just write code.`;

        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            config: { systemInstruction: systemInstruction },
            contents: [
               { role: 'user', parts: [{ text: `TEST TICKET: ${JSON.stringify(ticket)}\n\nPAGE OBJECTS: ${pageObjectContext}` }] }
            ]
        });
        ```
    * **Output Processing:** Extract `response.text()`. Ensure you strip out any Markdown code fences (the triple backticks) before saving to file.

2.  **Create `src/generator/writer.ts`:**
    * Save the output to `src/tests/[Module]/[ID]_[Title].spec.ts`.
    * Run `npx eslint --fix` to auto-format.

---

## 5. Workflow Automation Rules
*Instructions for the Antigravity Agent to execute daily.*

1.  **Extraction Trigger:**
    * Run `npx ts-node src/generator/main.ts`.
2.  **Validation:**
    * Check if new `.spec.ts` files were created.
    * If success, update Notion Ticket Status to "Automated".
3.  **Execution:**
    * Run `npx playwright test`.
4.  **Reporting:**
    * Run `npx allure generate ./allure-results --clean`.