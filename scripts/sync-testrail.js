const fs = require('fs');
const path = require('path');

const TESTRAIL_URL = process.env.TESTRAIL_URL || 'https://teguhsnts.testrail.io';
const TESTRAIL_USER = process.env.TESTRAIL_USER;
const TESTRAIL_API_KEY = process.env.TESTRAIL_API_KEY;
const TESTRAIL_PROJECT_ID = process.env.TESTRAIL_PROJECT_ID || '2';

const CUCUMBER_REPORT = path.join('reports', 'cucumber-report.json');
const BUG_REPORT = path.join('reports', 'bug-report.json');
const MAPPING_FILE = path.join('testrail-mapping.json');

function getAuthHeader() {
  const token = Buffer.from(`${TESTRAIL_USER}:${TESTRAIL_API_KEY}`).toString('base64');
  return `Basic ${token}`;
}

async function testrailRequest(endpoint, method = 'GET', body = null) {
  const response = await fetch(`${TESTRAIL_URL}/index.php?/api/v2/${endpoint}`, {
    method,
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(`TestRail API error [${endpoint}]:`, JSON.stringify(data));
  }
  return data;
}

async function createTestRun(name) {
  const run = await testrailRequest(`add_run/${TESTRAIL_PROJECT_ID}`, 'POST', {
    name,
    include_all: true
  });
  return run.id;
}

// TestRail status_id: 1 = Passed, 5 = Failed
async function addResult(runId, caseId, status, comment) {
  await testrailRequest(`add_result_for_case/${runId}/${caseId}`, 'POST', {
    status_id: status,
    comment
  });
}

function loadMapping() {
  if (!fs.existsSync(MAPPING_FILE)) {
    console.error('testrail-mapping.json tidak ditemukan.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
}

function extractTcTag(tags) {
  const tcTag = tags.find(t => /^@TC[-_]?\d+/i.test(t));
  if (!tcTag) return null;
  // Normalisasi: "@TC-01-Login" atau "@TC_03_Login" -> "TC01" / "TC03"
  const match = tcTag.match(/TC[-_]?(\d+)/i);
  if (!match) return null;
  const number = match[1].padStart(2, '0');
  return `TC${number}`;
}

async function syncReport(reportPath, runId, mapping) {
  if (!fs.existsSync(reportPath)) {
    console.log(`${reportPath} tidak ditemukan, dilewati.`);
    return;
  }

  const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  for (const feature of reportData) {
    for (const element of feature.elements || []) {
      const tags = (element.tags || []).map(t => t.name);
      const tcKey = extractTcTag(tags);

      if (!tcKey || !mapping[tcKey]) {
        console.log(`Skip: tidak ada mapping untuk scenario "${element.name}"`);
        continue;
      }

      const caseId = mapping[tcKey];
      const hasFailed = (element.steps || []).some(s => s.result?.status === 'failed');
      const status = hasFailed ? 5 : 1;
      const comment = hasFailed
        ? `Test FAILED. Scenario: ${element.name}. Lihat evidence di Jenkins build artifacts.`
        : `Test PASSED. Scenario: ${element.name}.`;

      await addResult(runId, caseId, status, comment);
      console.log(`Synced ${tcKey} (case ${caseId}) -> ${hasFailed ? 'FAILED' : 'PASSED'}`);
    }
  }
}

(async () => {
  const mapping = loadMapping();
  const runId = await createTestRun(`Automation Run - ${new Date().toISOString()}`);
  console.log(`TestRail run created: Run ID ${runId}`);

  await syncReport(CUCUMBER_REPORT, runId, mapping);
  await syncReport(BUG_REPORT, runId, mapping);

  console.log('\nSync selesai.');
})();