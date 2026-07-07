const { setWorldConstructor, setDefaultTimeout, Before, After, AfterStep } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
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
    console.warn(`Gagal membersihkan ${dirPath}, kemungkinan file sedang terkunci:`, err.message);
  }
}

// Bersihkan semua folder/file report lama sebelum run baru dimulai
if (fs.existsSync(STEP_DATA_FILE)) {
  try {
    fs.unlinkSync(STEP_DATA_FILE);
  } catch (err) {
    console.warn('Gagal hapus step-data.json:', err.message);
  }
}
safeCleanDir(SCREENSHOT_DIR);
safeCleanDir(VIDEO_DIR);

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

class CustomWorld {
  constructor({ attach, log, parameters }) {
    this.attach = attach;
    this.log = log;
    this.parameters = parameters;
  }

  async openBrowser() {
    this.browser = await chromium.launch({
      headless: this.parameters?.headless === true
      // slowMo: 300, // aktifkan lagi kalau mau lihat aksi diperlambat
    });

    this.context = await this.browser.newContext({
      recordVideo: {
        dir: VIDEO_DIR,
        size: { width: 1280, height: 720 }
      }
    });

    this.page = await this.context.newPage();
    this.stepCounter = 0;
  }

  async closeBrowser() {
    const videoPath = await this.page.video()?.path();

    if (this.context) {
      await this.context.close(); // video baru benar-benar ke-save setelah ini
    }
    if (this.browser) {
      await this.browser.close();
    }

    return videoPath;
  }
}

setWorldConstructor(CustomWorld);

Before(async function (scenario) {
  await this.openBrowser();
  this.currentScenarioName = scenario.pickle.name;
});

// Screenshot tiap step selesai (passed maupun failed)
AfterStep(async function ({ pickleStep, result }) {
  if (!this.page || this.page.isClosed()) {
    return;
  }

  this.stepCounter++;

  const safeScenario = this.currentScenarioName.replace(/[^a-zA-Z0-9]+/g, '_');
  const screenshotFileName = `${safeScenario}_step${this.stepCounter}.png`;
  const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFileName);

  await this.page.screenshot({ path: screenshotPath });

  // Attach ke Allure report
  const screenshotBuffer = fs.readFileSync(screenshotPath);
  this.attach(screenshotBuffer, 'image/png');

  // Simpan data step untuk PDF custom nanti
  let allData = [];
  if (fs.existsSync(STEP_DATA_FILE)) {
    allData = JSON.parse(fs.readFileSync(STEP_DATA_FILE, 'utf-8'));
  }

  allData.push({
    scenario: this.currentScenarioName,
    stepText: pickleStep.text,
    status: result.status,
    screenshotPath: screenshotPath.replace(/\\/g, '/')
  });

  fs.writeFileSync(STEP_DATA_FILE, JSON.stringify(allData, null, 2));
});

// Video full per scenario (dari awal sampai akhir), rename sesuai nama TC
After(async function (scenario) {
  const videoPath = await this.closeBrowser();

  if (!videoPath || !fs.existsSync(videoPath)) {
    return;
  }

  const scenarioName = scenario.pickle.name
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const newVideoName = `${scenarioName}.webm`;
  const newVideoPath = path.join(VIDEO_DIR, newVideoName);

  try {
    fs.renameSync(videoPath, newVideoPath);
  } catch (err) {
    console.warn('Gagal rename video:', err.message);
    return;
  }

  const videoBuffer = fs.readFileSync(newVideoPath);
  this.attach(videoBuffer, 'video/webm');
});