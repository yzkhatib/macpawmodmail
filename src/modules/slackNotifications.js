const https = require("https");

function truncate(text, maxLength) {
  if (! text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function getUserTag(user) {
  if (user.discriminator && user.discriminator !== "0") {
    return `${user.username}#${user.discriminator}`;
  }

  return user.username;
}

function sendWebhook(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(webhookUrl);
    } catch (err) {
      return reject(new Error(`Invalid Slack webhook URL: ${err.message}`));
    }

    const body = JSON.stringify(payload);
    const req = https.request({
      method: "POST",
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: `${parsed.pathname}${parsed.search}`,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let responseBody = "";
      res.on("data", chunk => responseBody += chunk);
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          return resolve();
        }

        reject(new Error(`Slack webhook returned ${res.statusCode || "unknown"}: ${responseBody}`));
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = ({ config, hooks }) => {
  if (! config.slackNotificationEnabled) return;

  if (! config.slackNotificationWebhookUrl) {
    console.warn("[WARN] Slack notifications are enabled, but slackNotificationWebhookUrl is missing");
    return;
  }

  hooks.afterNewMessageReceived(async ({ user, message, opts }) => {
    try {
      const attachmentCount = message?.attachments?.length || 0;
      const plainText = message?.content?.trim() || "<no text>";
      const thread = opts.thread;
      const payload = {
        text: `New MacPaw modmail message from ${getUserTag(user)}`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "New MacPaw modmail message",
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*User*\n${getUserTag(user)}`,
              },
              {
                type: "mrkdwn",
                text: `*User ID*\n\`${user.id}\``,
              },
              {
                type: "mrkdwn",
                text: `*Thread Channel ID*\n\`${thread.channel_id}\``,
              },
              {
                type: "mrkdwn",
                text: `*Attachments*\n${attachmentCount}`,
              },
            ],
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Message*\n${truncate(plainText, 2500)}`,
            },
          },
        ],
      };

      await sendWebhook(config.slackNotificationWebhookUrl, payload);
    } catch (err) {
      console.error("[WARN] Failed to send Slack notification:", err.message);
    }
  });
};
