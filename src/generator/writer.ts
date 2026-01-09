import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function saveTestFile(moduleName: string, ticketId: string, ticketTitle: string, code: string): Promise<string> {
    // 1. Sanitize Inputs
    const safeModule = moduleName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeTitle = ticketTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${ticketId}_${safeTitle}.spec.ts`;

    // 2. Define Path
    // Assuming we are running from root, target is src/tests/[Module]/
    const targetDir = path.join(process.cwd(), 'src', 'tests', safeModule);
    const filePath = path.join(targetDir, filename);

    // 3. Ensure Directory Exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // 4. Clean Code (Strip Markdown wrapping)
    let cleanCode = code.replace(/^```typescript\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    // 5. Write File
    fs.writeFileSync(filePath, cleanCode);
    console.log(`Saved test file to: ${filePath}`);

    // 6. Format with ESLint (Best effort)
    try {
        await execAsync(`npx eslint "${filePath}" --fix`);
        console.log(`Auto-formatted: ${filename}`);
    } catch (e) {
        console.warn(`Warning: ESLint failed to auto-fix ${filename}. It might have syntax errors.`, e);
    }

    return filePath;
}
