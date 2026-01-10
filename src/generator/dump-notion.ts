import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { getTestCandidates } from './fetcher';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID?.replace(/-/g, "");

async function dumpNotionData() {
    console.log("Starting Notion data dump...");

    if (!DATABASE_ID) {
        throw new Error("NOTION_DATABASE_ID is not defined in .env");
    }

    try {
        // 1. Fetch Raw Data
        console.log("Fetching raw data from Notion...");
        const response = await notion.dataSources.query({
            data_source_id: DATABASE_ID,
            filter: {
                property: 'Status',
                status: {
                    equals: 'Ready for Automation',
                },
            },
        });

        const rawOutputPath = path.join(process.cwd(), 'notion_raw_dump.json');
        fs.writeFileSync(rawOutputPath, JSON.stringify(response, null, 2));
        console.log(`Raw data saved to: ${rawOutputPath}`);

        // 1.5 Fetch Raw Page Content (Blocks)
        if (response.results.length > 0) {
            const firstPageId = response.results[0].id;
            console.log(`Fetching raw content for page ID: ${firstPageId}`);
            const blockResponse = await notion.blocks.children.list({ block_id: firstPageId });

            const contentOutputPath = path.join(process.cwd(), 'notion_content_dump.json');
            fs.writeFileSync(contentOutputPath, JSON.stringify(blockResponse, null, 2));
            console.log(`Raw page content saved to: ${contentOutputPath}`);
        }

        // 2. Fetch Processed Data (using existing fetcher logic)
        console.log("Fetching processed data using getTestCandidates...");
        const processedTickets = await getTestCandidates();

        const processedOutputPath = path.join(process.cwd(), 'notion_processed_dump.json');
        fs.writeFileSync(processedOutputPath, JSON.stringify(processedTickets, null, 2));
        console.log(`Processed data saved to: ${processedOutputPath}`);

    } catch (error) {
        console.error("Error dumping Notion data:", error);
    }
}

dumpNotionData();
