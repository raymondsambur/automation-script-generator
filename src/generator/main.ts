import * as fs from 'fs';
import * as path from 'path';
import { getTestCandidates, TestTicket } from './fetcher';
import { generateTestCode } from './translator';
import { saveTestFile } from './writer';

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
    // Read all .ts files in src/framework/pages
    const pagesDir = path.join(process.cwd(), 'src', 'framework', 'pages');
    let pageObjectContext = "";

    if (fs.existsSync(pagesDir)) {
        const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.ts'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
            pageObjectContext += `\n// FILE: ${file}\n${content}\n`;
        }
        console.log(`Loaded context from ${files.length} page objects.`);
    } else {
        console.warn(`Warning: Page Object directory not found at ${pagesDir}. Generating without specific POM context.`);
    }

    // 3. Translate & Write
    for (const ticket of tickets) {
        console.log(`\n-----------------------------------`);
        console.log(`Processing [${ticket.id}] ${ticket.title}...`);

        try {
            console.log("  > Asking Gemini to generate code...");
            const code = await generateTestCode(ticket, pageObjectContext);

            console.log("  > Saving file...");
            const savedPath = await saveTestFile(ticket.module, ticket.id, ticket.title, code);

            console.log(`  ✅ Success! Created ${savedPath}`);
            // TODO: Update Notion status to 'Automated' (Future Phase)

        } catch (error) {
            console.error(`  ❌ Failed to process ticket ${ticket.id}`, error);
        }
    }

    console.log("\nBatch complete.");
}

main();
