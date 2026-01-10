
import { Client } from '@notionhq/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID?.replace(/-/g, "");

interface TestResult {
    testId: string;
    status: 'Done' | 'Automation Failed';
    notes: string;
}

async function updateNotion() {
    console.log('🔄 Starting Notion Update...');

    if (!DATABASE_ID) {
        console.error('❌ NOTION_DATABASE_ID is missing in .env');
        process.exit(1);
    }

    const resultsPath = path.resolve(process.cwd(), 'test-results.json');
    if (!fs.existsSync(resultsPath)) {
        console.error('❌ test-results.json not found. Run tests first.');
        process.exit(1);
    }

    const testResultsRaw = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const updates: TestResult[] = [];

    // Parse Playwright JSON report
    const traverseSuites = (suites: any[]) => {
        suites.forEach(suite => {
            if (suite.specs) {
                suite.specs.forEach((spec: any) => {
                    const title = spec.title;
                    const match = title.match(/^(TC-\d+)/);
                    if (match) {
                        const testId = match[1];
                        const lastResult = spec.tests[0].results[spec.tests[0].results.length - 1];
                        const status = lastResult.status === 'passed' ? 'Done' : 'Automation Failed';
                        let notes = '';

                        if (status === 'Automation Failed') {
                            try {
                                const errorObj = lastResult.errors?.[0];
                                const rawError = errorObj?.message;

                                if (typeof rawError !== 'string') {
                                    notes = 'Error message is not a string.';
                                } else {
                                    // Simple ANSI strip using a safe robust regex
                                    // eslint-disable-next-line no-control-regex
                                    const cleanAnsi = rawError.replace(/\u001b\[.*?m/g, '');

                                    const lines = cleanAnsi.split('\n');
                                    let finalNote = lines[0].trim();
                                    if (finalNote.length > 100) finalNote = finalNote.substring(0, 100) + '...';

                                    const callLogIndex = lines.findIndex(l => l.includes('Call log:'));
                                    if (callLogIndex !== -1 && lines[callLogIndex + 1]) {
                                        finalNote += '\n' + lines[callLogIndex + 1].trim();
                                    }
                                    notes = finalNote;
                                }
                            } catch (e) {
                                console.error('Error parsing:', e);
                                notes = 'Extracted Error';
                            }
                        }
                        updates.push({ testId, status, notes });
                    }
                });
            }
            if (suite.suites) {
                traverseSuites(suite.suites);
            }
        });
    };

    traverseSuites(testResultsRaw.suites);

    console.log(`📊 Found ${updates.length} test results to sync.`);

    // Update Notion for each result
    for (const update of updates) {
        try {
            const idNumber = parseInt(update.testId.replace('TC-', ''));
            console.log(`🔍 Querying Notion for Test ID: ${idNumber} (Original: ${update.testId})...`);

            // 1. Find the Notion Page for this Test ID
            const response = await notion.dataSources.query({
                data_source_id: DATABASE_ID,
                filter: {
                    property: 'Test ID',
                    unique_id: {
                        equals: idNumber
                    }
                }
            });

            console.log(`   > Found ${response.results.length} pages.`);

            if (response.results.length === 0) {
                console.warn(`⚠️ Ticket ${update.testId} not found in Notion.`);
                continue;
            }

            const pageId = response.results[0].id;
            console.log(`   > Page ID: ${pageId}`);
            const now = new Date().toISOString();

            // 2. Update Properties
            const updatePayload: any = {
                page_id: pageId,
                properties: {
                    'Status': {
                        status: {
                            name: update.status
                        }
                    },
                    'Last Run': {
                        date: {
                            start: now
                        }
                    }
                }
            };

            // Only add Notes if it's failed, otherwise we might want to clear it or leave it?
            // Let's explicitly clear it if passed OR set it if failed.
            if (update.status === 'Automation Failed') {
                updatePayload.properties['Notes'] = {
                    rich_text: [
                        {
                            text: {
                                content: update.notes.substring(0, 2000) // Truncate to avoid Notion limits
                            }
                        }
                    ]
                };
            } else {
                // Optional: Clear notes on success
                updatePayload.properties['Notes'] = {
                    rich_text: []
                };
            }

            await notion.pages.update(updatePayload);

            console.log(`✅ Updated ${update.testId}: ${update.status}`);

        } catch (error) {
            console.error(`❌ Failed to update ${update.testId}:`, error);
            if ((error as any).body) {
                console.error('Error Body:', JSON.stringify(JSON.parse((error as any).body), null, 2));
            }
        }
    }

    console.log('🏁 Notion Update Complete.');
}

updateNotion();
