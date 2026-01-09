import { getTestCandidates } from './fetcher';
import * as dotenv from 'dotenv';

dotenv.config();

console.log("Testing Notion fetching...");
getTestCandidates()
    .then(tickets => {
        console.log(`Successfully fetched ${tickets.length} tickets:`);
        console.log(JSON.stringify(tickets, null, 2));
    })
    .catch(err => {
        console.error("Failed to fetch tickets:", err);
    });
