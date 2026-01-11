
const { spawnSync } = require('child_process');

console.log('🚀 Starting Test Suite...');

// 1. Run Playwright Tests
const testResult = spawnSync('npx', ['playwright', 'test'], { stdio: 'inherit', shell: true });

console.log(`\nTests finished with Exit Code: ${testResult.status}`);
// We don't exit here. We continue to updater.

// 2. Run Notion Updater
console.log('\n📝 Updating Notion...');
const updaterResult = spawnSync('npx', ['ts-node', 'src/reporter/notion-updater.ts'], { stdio: 'inherit', shell: true });

// 3. Exit with the Test's exit code (so CI fails if tests failed)
process.exit(testResult.status ?? 1);
