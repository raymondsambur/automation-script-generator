# Automation Script Generator

## 🚀 Project Mission: Hybrid AI Automation Framework (Notion -> Playwright)

This project creates an autonomous end-to-end testing framework that bridges the gap between manual test case management and automated execution. It leverages Generative AI to automatically generate robust Playwright test scripts from Notion test tickets.

## 🎯 Objectives

1.  **Read**: Fetch test scenarios directly from a Notion Database.
2.  **Generate**: Create executable Playwright (TypeScript) scripts automatically using **Google Gemini**.
3.  **Execute**: Run tests with a "Self-Healing" mechanism for resilient locators.
4.  **Report**: Generate detailed reports via Allure and reflect status updates back to Notion.

## 🛠️ Tech Stack

*   **Language**: TypeScript, Node.js (v20+)
*   **Framework**: [Playwright](https://playwright.dev/)
*   **AI Model**: Google Gemini (`gemini-2.0-flash` via `@google/genai` SDK)
*   **Integration**: Notion API (`@notionhq/client`)
*   **Reporting**: Allure Report

## 📂 Directory Structure

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
├── .env                      # Contains API Keys
└── package.json
```

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd automation-script-generator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and add your keys:
    ```env
    GEMINI_API_KEY=your_google_gemini_api_key
    NOTION_TOKEN=your_notion_integration_token
    NOTION_DATABASE_ID=your_notion_database_id
    ```

## 🏃 Usage

### 1. Generate Tests
To fetch "Ready for Automation" tickets from Notion and generate Playwright test files with **strict Page Object Model separation**:
```bash
npx ts-node src/generator/main.ts
```
*   **Artifacts**:
    *   `src/framework/pages/*.page.ts`: Page Objects (private selectors, public methods).
    *   `src/tests/[module]/data/[id].data.ts`: Dedicated test data files.
    *   `src/tests/[module]/[id]...spec.ts`: Clean test specs.

### 2. Run Tests
To execute the generated Playwright tests:
```bash
npm test
```
*   **Video**: Recorded for ALL runs (available in Allure report).
*   **Screenshots**: Captured only on failure.

### 3. View Reports
To generate and view the Allure test report:
```bash
npm run test:report   # Generates report (cleans old results)
npm run test:open     # Opens report in browser
```

## 🧠 Smart Actions (Self-Healing)
The framework includes a `SmartPage` wrapper that handles flaky selectors. If a primary selector fails, it attempts to "heal" by using fallback strategies (like text hints) and logs the event, preventing brittle test failures.
