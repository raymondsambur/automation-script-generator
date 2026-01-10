import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID?.replace(/-/g, "");

export interface TestTicket {
    id: string;
    title: string;
    module: string;
    status: string;
    selectors: Record<string, string>; // New field
    prerequisites: Record<string, string>;
    steps: Record<string, string>;
    expectedResult: Record<string, string>;
    testData: any;
}

export async function getTestCandidates(): Promise<TestTicket[]> {
    if (!DATABASE_ID) {
        throw new Error("NOTION_DATABASE_ID is not defined in .env");
    }

    try {
        // We use 'any' cast here if necessary to avoid strict type issues with the installed client version,
        // but this matches the original intent of using the standard .query() method.
        const response = await notion.dataSources.query({
            data_source_id: DATABASE_ID,
            filter: {
                property: 'Status',
                status: {
                    equals: 'Ready for Automation',
                },
            },
        });

        const intermediateResults = response.results.map((page: any, index: number) => {
            const props = page.properties;
            // Debugging: Log properties to find the 'Selectors' field structure
            if (index === 0) { // Log only for the first item to avoid spam
                console.log('Property Keys:', Object.keys(props));
                const selectorsKey = Object.keys(props).find(k => k.toLowerCase().includes('selector'));
                if (selectorsKey) {
                    console.log(`Found Key: ${selectorsKey}`);
                    console.log('Value:', JSON.stringify(props[selectorsKey], null, 2));
                } else {
                    console.log('No "Selectors" key found.');
                }
            }

            // Extract rich text / title helpers
            const getTitle = (p: any) => p?.title?.[0]?.plain_text || '';
            const getText = (p: any) => p?.rich_text?.[0]?.plain_text || '';
            const getSelect = (p: any) => p?.select?.name || '';
            const getStatus = (p: any) => p?.status?.name || '';
            // Handle Number, Formula, or Unique ID for ID
            const getId = (p: any) => {
                if (p?.type === 'formula') return p.formula.string || p.formula.number?.toString() || '';
                if (p?.type === 'unique_id') return (p.unique_id.prefix ? p.unique_id.prefix + '-' : '') + p.unique_id.number;
                return p?.number?.toString() || '';
            };

            // Helper to parse Selectors (assuming JSON in Rich Text)
            const getSelectors = (p: any) => {
                const text = getText(p);
                if (!text) return {};
                try {
                    // Handle potential markdown code blocks if the user copy-pasted code
                    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
                    const cleanText = codeBlockMatch ? codeBlockMatch[1] : text;
                    return JSON.parse(cleanText);
                } catch (e) {
                    console.warn(`Failed to parse Selectors JSON.`, e);
                    return {};
                }
            };

            const ticket: TestTicket = {
                id: getId(props['Test ID']),
                title: getTitle(props['Title']),
                module: getSelect(props['Module']),
                status: getStatus(props['Status']),
                selectors: getSelectors(props['Selectors']), // Map the new field
                prerequisites: {},
                steps: {}, // Will be populated from content
                expectedResult: {},
                testData: {}, // Test Data not found in props
            };

            return { ticket, pageId: page.id };
        });

        // 2. Fetch content for each ticket
        const enrichedTickets = await Promise.all(intermediateResults.map(async ({ ticket, pageId }) => {
            const fullContent = await fetchPageContent(pageId);
            const parsed = parseTestContent(fullContent);

            ticket.prerequisites = parsed.prerequisites;
            ticket.steps = parsed.steps;
            ticket.expectedResult = parsed.expectedResult;
            ticket.testData = parsed.testData;

            return ticket;
        }));

        return enrichedTickets;

    } catch (error) {
        console.error("Error fetching tickets from Notion:", error);
        throw error;
    }
}

async function fetchPageContent(pageId: string): Promise<string> {
    try {
        const response = await notion.blocks.children.list({ block_id: pageId });
        let listCounter = 1;

        return response.results.map((block: any, index: number, array: any[]) => {
            // Check if we are in a numbered list sequence
            if (block.type === 'numbered_list_item') {
                const text = `${listCounter}. ` + block.numbered_list_item.rich_text.map((t: any) => t.plain_text).join('');
                listCounter++;
                return text;
            } else {
                // Reset counter if the sequence breaks
                listCounter = 1;
            }

            if (block.type === 'paragraph') return block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
            if (block.type === 'heading_1') return '# ' + block.heading_1.rich_text.map((t: any) => t.plain_text).join('');
            if (block.type === 'heading_2') return '## ' + block.heading_2.rich_text.map((t: any) => t.plain_text).join('');
            if (block.type === 'heading_3') return '### ' + block.heading_3.rich_text.map((t: any) => t.plain_text).join('');
            if (block.type === 'bulleted_list_item') return '- ' + block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join('');
            if (block.type === 'code') return '```' + block.code.language + '\n' + block.code.rich_text.map((t: any) => t.plain_text).join('') + '\n```';
            // Add more block types as needed
            return '';
        }).filter(line => line).join('\n');
    } catch (e) {
        console.warn(`Failed to fetch content for page ${pageId}`, e);
        return '';
    }
}

function parseTestContent(content: string): { prerequisites: Record<string, string>, steps: Record<string, string>, expectedResult: Record<string, string>, testData: any } {
    const sections = {
        prerequisites: {} as Record<string, string>,
        steps: {} as Record<string, string>,
        expectedResult: {} as Record<string, string>,
        testData: {}
    };

    // Regex to capture sections allowing for Flexible headers
    const prerequisitesMatch = content.match(/(?:#+\s*)?Prerequisites\s*\n([\s\S]*?)(?=\n\s*(?:#+\s*)?(?:Test Steps|Expected Result|Test Data|$))/i);
    const stepsMatch = content.match(/(?:#+\s*)?Test Steps\s*\n([\s\S]*?)(?=\n\s*(?:#+\s*)?(?:Expected Result|Test Data|$))/i);
    const expectedMatch = content.match(/(?:#+\s*)?Expected Results?\s*\n([\s\S]*?)(?=\n\s*(?:#+\s*)?(?:Test Data|$))/i);
    const testDataMatch = content.match(/(?:#+\s*)?Test Data\s*\n([\s\S]*?)(?=$)/i);

    if (prerequisitesMatch) sections.prerequisites = parseListToObject(prerequisitesMatch[1], 'prerequisites');
    if (stepsMatch) sections.steps = parseListToObject(stepsMatch[1], 'step');
    if (expectedMatch) sections.expectedResult = parseListToObject(expectedMatch[1], 'expectedResult');

    if (testDataMatch) {
        const rawData = testDataMatch[1].trim();


        // Extract JSON from code block if present
        const codeBlockMatch = rawData.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        const cleanData = codeBlockMatch ? codeBlockMatch[1] : rawData;

        try {
            sections.testData = JSON.parse(cleanData);
        } catch (e) {
            console.warn("Failed to parse Test Data JSON:", e);
        }
    }

    // Fallback: if no sections found, treat content as one big step? 
    if (Object.keys(sections.steps).length === 0 && Object.keys(sections.prerequisites).length === 0 && Object.keys(sections.expectedResult).length === 0 && content.trim()) {
        sections.steps = parseListToObject(content, 'step');
    }

    return sections;
}

function parseListToObject(text: string, prefix: string): Record<string, string> {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const obj: Record<string, string> = {};
    lines.forEach((line, index) => {
        // Remove leading numbering or bullets like "1. ", "- ", "*"
        const cleanLine = line.replace(/^[\d]+\.\s*|^-\s*|^\*\s*/, '');
        obj[`${prefix}${index + 1}`] = cleanLine;
    });
    return obj;
}
