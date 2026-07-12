const { execSync } = require('child_process');

const args = process.argv.slice(2);
const browserArg = args.find(a => a.startsWith('--browser='));
const tagsArg = args.find(a => a.startsWith('--tags='));

const browser = browserArg ? browserArg.split('=')[1] : 'chromium';
const tags = tagsArg ? tagsArg.split('=').slice(1).join('=') : 'not @bug';

const browsersToRun = browser === 'all' ? ['chromium', 'firefox', 'webkit'] : [browser];

let anyFailed = false;

browsersToRun.forEach((b, index) => {
  console.log(`\n=== Running on ${b} ===\n`);

  const skipCleanup = index > 0 ? 'true' : 'false';
  const env = { ...process.env, SKIP_CLEANUP: skipCleanup };

  try {
    execSync(
      `npx cucumber-js --tags "${tags}" --world-parameters "{\\"browser\\":\\"${b}\\"}"`,
      { stdio: 'inherit', env }
    );
  } catch (err) {
    console.error(`Test gagal di ${b}`);
    anyFailed = true;
  }
});

process.exit(anyFailed ? 1 : 0);