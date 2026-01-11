import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper to clean and format
async function writeAndFormat(filePath: string, code: string): Promise<void> {
    let cleanCode = code.replace(/^```typescript\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    fs.writeFileSync(filePath, cleanCode);

    try {
        await execAsync(`npx eslint "${filePath}" --fix`);
        console.log(`Auto-formatted: ${path.basename(filePath)}`);
    } catch (e) {
        console.warn(`Warning: ESLint failed to auto-fix ${path.basename(filePath)}.`, e);
    }
}

export async function saveTestFile(moduleName: string, ticketId: string, ticketTitle: string, code: string): Promise<string> {
    // 1. Sanitize Inputs
    const safeModule = moduleName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeTitle = ticketTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${ticketId}_${safeTitle}.spec.ts`;

    // 2. Define Path
    const targetDir = path.join(process.cwd(), 'src', 'tests', safeModule);
    const filePath = path.join(targetDir, filename);

    // 3. Ensure Directory Exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // 4. Write & Format
    await writeAndFormat(filePath, code);
    console.log(`Saved test file to: ${filePath}`);

    return filePath;
}

export async function savePageObject(moduleName: string, code: string): Promise<string> {
    const safeModule = moduleName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeModule}.page.ts`;
    const targetDir = path.join(process.cwd(), 'src', 'framework', 'pages');
    const filePath = path.join(targetDir, filename);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    await writeAndFormat(filePath, code);
    console.log(`Saved Page Object to: ${filePath}`);

    return filePath;
}

export async function saveTestData(moduleName: string, code: string): Promise<string> {
    const safeModule = moduleName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeModule}.data.ts`; // SHARED data file

    const targetDir = path.join(process.cwd(), 'src', 'tests', safeModule); // Save DIRECTLY in module dir
    const filePath = path.join(targetDir, filename);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    await writeAndFormat(filePath, code);
    console.log(`Saved Test Data to: ${filePath}`);

    return filePath;
}
