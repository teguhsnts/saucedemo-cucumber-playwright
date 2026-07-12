const https = require('https');

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const BUILD_STATUS = process.argv[2] || 'UNKNOWN';
const BUILD_URL = process.env.BUILD_URL || '';
const JOB_NAME = process.env.JOB_NAME || 'saucedemo-automation-test';
const BUILD_NUMBER = process.env.BUILD_NUMBER || '';

function buildMessage() {
  const isSuccess = BUILD_STATUS === 'SUCCESS';
  const isUnstable = BUILD_STATUS === 'UNSTABLE';

  const color = isSuccess ? '#36a64f' : isUnstable ? '#ffcc00' : '#e01e5a';
  const emoji = isSuccess ? '✅' : isUnstable ? '⚠️' : '❌';
  const statusText = isSuccess ? 'SUCCESS' : isUnstable ? 'UNSTABLE' : 'FAILED';

  return {
    attachments: [
      {
        color: color,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} *${JOB_NAME}* — Build #${BUILD_NUMBER}\n*Status:* ${statusText}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<${BUILD_URL}|View Build Details> | <${BUILD_URL}artifact/|Download Artifacts>`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Triggered at ${new Date().toISOString()}`
              }
            ]
          }
        ]
      }
    ]
  };
}

function sendToSlack(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const url = new URL(WEBHOOK_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Slack notification sent successfully.');
          resolve();
        } else {
          console.error(`Slack notification failed: ${res.statusCode} - ${responseBody}`);
          reject(new Error(responseBody));
        }
      });
    });

    req.on('error', (err) => {
      console.error('Error sending Slack notification:', err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

(async () => {
  if (!WEBHOOK_URL) {
    console.error('SLACK_WEBHOOK_URL tidak ditemukan.');
    process.exit(0); // tidak menggagalkan build hanya karena notifikasi gagal
  }

  try {
    await sendToSlack(buildMessage());
  } catch (err) {
    console.error('Gagal mengirim notifikasi Slack:', err.message);
  }
})();