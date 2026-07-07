const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const STEP_DATA_FILE = path.join('reports', 'step-data.json');
const OUTPUT_DIR = path.join('reports', 'pdf');

function buildHtml(scenarioName, steps) {
  let html = `
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 8px; }
      .step { page-break-inside: avoid; margin-bottom: 25px; border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
      .step-text { font-size: 14px; margin-bottom: 8px; }
      .status { font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
      .PASSED { background: #d4edda; color: #155724; }
      .FAILED { background: #f8d7da; color: #721c24; }
      .SKIPPED { background: #fff3cd; color: #856404; }
      img { max-width: 100%; border: 1px solid #ccc; margin-top: 8px; }
    </style>
  </head>
  <body>
    <h1>${scenarioName}</h1>
  `;

  steps.forEach((step, index) => {
    html += `
      <div class="step">
        <div class="step-text">
          Step ${index + 1}: ${step.stepText}
          <span class="status ${step.status}">${step.status}</span>
        </div>
        <img src="${path.resolve(step.screenshotPath)}" />
      </div>
    `;
  });

  html += `</body></html>`;
  return html;
}

(async () => {
  if (!fs.existsSync(STEP_DATA_FILE)) {
    console.error('step-data.json tidak ditemukan. Jalankan test dulu.');
    process.exit(1);
  }

  const stepData = JSON.parse(fs.readFileSync(STEP_DATA_FILE, 'utf-8'));

  // Kelompokkan step berdasarkan scenario
  const grouped = {};
  for (const item of stepData) {
    if (!grouped[item.scenario]) grouped[item.scenario] = [];
    grouped[item.scenario].push(item);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const [scenarioName, steps] of Object.entries(grouped)) {
    const safeName = scenarioName.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const htmlPath = path.join(OUTPUT_DIR, `${safeName}.html`);
    const pdfPath = path.join(OUTPUT_DIR, `${safeName}.pdf`);

    const html = buildHtml(scenarioName, steps);
    fs.writeFileSync(htmlPath, html);

    const page = await browser.newPage();
    // await page.goto(`file://${path.resolve(htmlPath)}`, { waitUntil: 'networkidle0' });
    await page.goto(`file://${path.resolve(htmlPath)}`, {
      waitUntil: 'networkidle0',
      timeout: 60000 // naikkan dari default 30000ms jadi 60 detik
    });

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    await page.close();
    console.log(`PDF generated: ${pdfPath}`);
  }

  await browser.close();
  console.log('Semua PDF per scenario selesai dibuat.');
})();