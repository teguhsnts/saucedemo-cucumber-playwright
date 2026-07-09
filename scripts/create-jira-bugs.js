const fs = require('fs');
const path = require('path');

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://teguhsnts2903.atlassian.net';
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'SD';

// Argument dari command line: "known" atau "unexpected"
const mode = process.argv[2] || 'known';

const CUCUMBER_REPORT = mode === 'unexpected'
  ? path.join('reports', 'cucumber-report.json')
  : path.join('reports', 'bug-report.json');

const LABEL = mode === 'unexpected' ? 'automation-urgent' : 'automation-known-bug';
const SUMMARY_PREFIX = mode === 'unexpected'
  ? '[URGENT] Unexpected test failure'
  : '[Automation] Known bug detected';

function getAuthHeader() {
  const token = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  return `Basic ${token}`;
}

async function createJiraIssue(scenarioName, errorMessage, tags) {
  const url = `${JIRA_BASE_URL}/rest/api/3/issue`;

  const body = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: `${SUMMARY_PREFIX}: ${scenarioName}`,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Scenario: ${scenarioName}\n\nTags: ${tags.join(', ')}\n\nError:\n${errorMessage}\n\nEvidence (video/screenshot) tersedia di Jenkins build artifacts.\n\nMode: ${mode === 'unexpected' ? 'Kegagalan tidak terduga pada Main Test Suite - butuh investigasi segera' : 'Known bug pada scenario testing'}`
              }
            ]
          }
        ]
      },
      issuetype: { name: 'Bug' },
      labels: [LABEL],
      priority: { name: mode === 'unexpected' ? 'High' : 'Low' }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (response.ok) {
    console.log(`Jira issue created: ${data.key} - ${scenarioName} [${LABEL}]`);
  } else {
    console.error(`Failed to create Jira issue for "${scenarioName}":`, JSON.stringify(data));
  }
}

(async () => {
  if (!fs.existsSync(CUCUMBER_REPORT)) {
    console.log(`${CUCUMBER_REPORT} tidak ditemukan — tidak ada yang perlu diproses.`);
    process.exit(0);
  }

  const reportData = JSON.parse(fs.readFileSync(CUCUMBER_REPORT, 'utf-8'));
  let bugCount = 0;

  for (const feature of reportData) {
    for (const element of feature.elements || []) {
      const failedStep = (element.steps || []).find(s => s.result?.status === 'failed');
      if (failedStep) {
        const scenarioName = element.name;
        const errorMessage = failedStep.result.error_message || 'No error message';
        const tags = (element.tags || []).map(t => t.name);
        await createJiraIssue(scenarioName, errorMessage, tags);
        bugCount++;
      }
    }
  }

  console.log(`\nTotal ${bugCount} Jira issue(s) processed (mode: ${mode}).`);
})();