import * as fs from 'fs';
import * as path from 'path';
import { getTestCandidates, TestTicket } from './fetcher';
import { generateTestCode, generatePageObject, generateTestData } from './translator';
import { saveTestFile, savePageObject, saveTestData } from './writer';

async function main() {
    console.log("🚀 Antigravity Generator Starting...");

    // 1. Fetch Tickets
    console.log("Fetching tickets from Notion...");
    let tickets: TestTicket[] = [];
    try {
        tickets = await getTestCandidates();
    } catch (e) {
        console.error("Failed to fetch tickets.", e);
        process.exit(1);
    }

    if (tickets.length === 0) {
        console.log("No tickets found with status 'Ready for Automation'. Exiting.");
        return;
    }

    console.log(`Found ${tickets.length} tickets to process.`);

    // 2. Load Page Object Context
    // Optimization: We now load context dynamically per-ticket to save tokens.
    // See "Smart Injection" below.
    const pagesDir = path.join(process.cwd(), 'src', 'framework', 'pages');

    // 3. Translate & Write
    for (const ticket of tickets) {
        console.log(`\n-----------------------------------`);
        console.log(`Processing [${ticket.id}] ${ticket.title}...`);

        try {
            // Step 1: Handle Page Object
            const pageModuleName = ticket.module.toLowerCase(); // simplified mapping for now
            const safePageModule = pageModuleName.replace(/[^a-z0-9]/gi, '_');
            const pageFileName = `${safePageModule}.page.ts`;
            const pageFilePath = path.join(pagesDir, pageFileName);

            let existingPageCode = "";
            if (fs.existsSync(pageFilePath)) {
                existingPageCode = fs.readFileSync(pageFilePath, 'utf-8');
                console.log(`  > Found existing Page Object: ${pageFileName}`);
            } else {
                console.log(`  > Creating NEW Page Object: ${pageFileName}`);
            }

            // ONLY generate page object if there's no existing code OR if we want to update it.
            // For now, let's always attempt to "Ensure" the page object covers our needs.
            console.log("  > Asking Gemini to update/generate Page Object...");

            const updatedPageCode = await generatePageObject(ticket, existingPageCode);
            await savePageObject(ticket.module, updatedPageCode);


            // Step 2: Reload Context (Smart Injection)
            // Strategy: Only load Core Pages (Authentication) + Current Module Page
            // This significantly reduces token usage compared to loading ALL pages.

            const corePages = ['authentication.page.ts'];
            const currentModulePage = pageFileName; // calculated above (e.g. title.page.ts)

            // Create a unique set of pages to load (avoid duplicates if current module IS authentication)
            const pagesToLoad = new Set([...corePages, currentModulePage]);

            let currentContext = "";
            console.log(`  > Loading Context from: ${Array.from(pagesToLoad).join(', ')}`);

            for (const p of pagesToLoad) {
                const pPath = path.join(pagesDir, p);
                if (fs.existsSync(pPath)) {
                    const content = fs.readFileSync(pPath, 'utf-8');
                    currentContext += `\n// FILE: ${p}\n${content}\n`;
                }
            }


            // 5. Generate & Save Shared Test Data
            console.log(`  > Generatng/Updating Shared Module Data...`);

            // Construct path to centralized shared data file: src/framework/data/<module>.data.ts
            const safeTestModule = ticket.module.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const dataFileName = `${safeTestModule}.data.ts`;
            const dataDir = path.join(process.cwd(), 'src', 'framework', 'data');
            const dataFilePath = path.join(dataDir, dataFileName);

            let existingData = "";
            if (fs.existsSync(dataFilePath)) {
                existingData = fs.readFileSync(dataFilePath, 'utf-8');
            }

            const testDataCode = await generateTestData(ticket, existingData);
            await saveTestData(ticket.module, testDataCode);


            // 6. Generate Test Code
            const testFileName = `${ticket.id.replace(/-/g, '_')}.spec.ts`;
            const testFilePath = path.join(process.cwd(), 'src', 'tests', safeTestModule, testFileName);

            // Calculate Imports
            // testFilePath: src/tests/<module>/TC.spec.ts
            // dataFilePath: src/framework/data/<module>.data.ts
            // We want path relative to test file.
            let dataImportPath = path.relative(path.dirname(testFilePath), dataFilePath).replace(/\\/g, '/').replace(/\.ts$/, '');
            if (!dataImportPath.startsWith('.')) {
                dataImportPath = './' + dataImportPath;
            }

            let pageImportPath = path.relative(path.dirname(testFilePath), pageFilePath).replace(/\\/g, '/').replace(/\.ts$/, '');
            if (!pageImportPath.startsWith('.')) {
                pageImportPath = './' + pageImportPath;
            }

            console.log(`  > Asking Gemini to generate Test Code...`);
            // Pass testDataCode (the content) as context so the LLM knows what to import
            const testCode = await generateTestCode(ticket, currentContext, dataImportPath, testDataCode, pageImportPath);

            // 7. Save Test File
            await saveTestFile(ticket.module, ticket.id, ticket.title, testCode);
            console.log(`  > Test Saved to: ${testFilePath}`);

            // TODO: Update Notion status to 'Automated' (Future Phase)

        } catch (error) {
            console.error(`  ❌ Failed to process ticket ${ticket.id}`, error);
        }

        console.log("  Waiting 5s to avoid Rate Limits...");
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log("\nBatch complete.");
}

main();
