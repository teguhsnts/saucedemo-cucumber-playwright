const { setWorldConstructor, setDefaultTimeout, Before, After, AfterStep } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

setDefaultTimeout(30 * 1000);

const STEP_DATA_FILE = path.join('reports', 'step-data.json');
const SCREENSHOT_DIR = path.join('reports', 'screenshots');
const VIDEO_DIR = path.join('reports', 'videos');

function safeCleanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch (err) {
    console.warn(`Gagal membersihkan ${dirPath}:`, err.message);
  }
}

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function getBrowserEngine(browserName) {
  switch (browserName) {
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
    case 'chromium':
    default:
      return chromium;
  }
}

// Cleanup hanya sekali di awal jika ini bukan sub-run dari kombinasi "all"
// (Untuk kombinasi "all", kita handle cleanup di level script/Jenkinsfile, bukan di sini)
const SKIP_CLEANUP = process.env.SKIP_CLEANUP === 'true';

if (!SKIP_CLEANUP) {
  if (fs.existsSync(STEP_DATA_FILE)) {
    try {
      fs.unlinkSync(STEP_DATA_FILE);
    } catch (err) {
      console.warn('Gagal hapus step-data.json:', err.message);
    }
  }
  safeCleanDir(SCREENSHOT_DIR);
  safeCleanDir(VIDEO_DIR);
}

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

class CustomWorld {
  constructor({ attach, log, parameters }) {
    this.attach = attach;
    this.log = log;
    this.parameters = parameters;
  }

  async openBrowser(scenarioVideoDir) {
    const browserName = this.parameters?.browser || 'chromium';
    const engine = getBrowserEngine(browserName);
    this.browserName = browserName;

    this.browser = await engine.launch({
      headless: this.parameters?.headless === true
    });

    this.context = await this.browser.newContext({
      recordVideo: {
        dir: scenarioVideoDir,
        size: { width: 1280, height: 720 }
      }
    });

    this.page = await this.context.newPage();
    this.stepCounter = 0;
  }

  async closeBrowser() {
    const videoPath = await this.page.video()?.path();

    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }

    return videoPath;
  }
}

setWorldConstructor(CustomWorld);

Before(async function (scenario) {
  this.currentScenarioName = scenario.pickle.name;
  this.safeScenarioName = sanitizeName(this.currentScenarioName);

  const browserName = this.parameters?.browser || 'chromium';

  this.scenarioScreenshotDir = path.join(SCREENSHOT_DIR, browserName, this.safeScenarioName);
  this.scenarioVideoDir = path.join(VIDEO_DIR, browserName, this.safeScenarioName);

  fs.mkdirSync(this.scenarioScreenshotDir, { recursive: true });
  fs.mkdirSync(this.scenarioVideoDir, { recursive: true });

  await this.openBrowser(this.scenarioVideoDir);
});

AfterStep(async function ({ pickleStep, result }) {
  if (!this.page || this.page.isClosed()) {
    return;
  }

  this.stepCounter++;

  const screenshotFileName = `step${this.stepCounter}.png`;
  const screenshotPath = path.join(this.scenarioScreenshotDir, screenshotFileName);

  await this.page.screenshot({ path: screenshotPath });

  const screenshotBuffer = fs.readFileSync(screenshotPath);
  this.attach(screenshotBuffer, 'image/png');

  let allData = [];
  if (fs.existsSync(STEP_DATA_FILE)) {
    allData = JSON.parse(fs.readFileSync(STEP_DATA_FILE, 'utf-8'));
  }

  allData.push({
    scenario: this.currentScenarioName,
    browser: this.browserName,
    stepText: pickleStep.text,
    status: result.status,
    screenshotPath: screenshotPath.replace(/\\/g, '/')
  });

  fs.writeFileSync(STEP_DATA_FILE, JSON.stringify(allData, null, 2));
});

After(async function () {
  const videoPath = await this.closeBrowser();

  if (!videoPath || !fs.existsSync(videoPath)) {
    return;
  }

  const newVideoPath = path.join(this.scenarioVideoDir, 'video.webm');

  try {
    fs.renameSync(videoPath, newVideoPath);
  } catch (err) {
    console.warn('Gagal rename video:', err.message);
    return;
  }

  const videoBuffer = fs.readFileSync(newVideoPath);
  this.attach(videoBuffer, 'video/webm');
});