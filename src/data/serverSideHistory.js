const fs = require("fs");
const path = require("path");

const config = require("../cfg");
const { formatters } = require("../formatters");
const settings = require("./settings");

function getServerSideHistoryBaseDir() {
  return path.resolve(__dirname, "..", "..", config.serverSideHistoryDirectory);
}

function getThreadHistoryPath(thread) {
  const safeUserName = String(thread.user_name || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";

  const userDir = path.join(getServerSideHistoryBaseDir(), `${thread.user_id}-${safeUserName}`);
  const filename = `thread-${thread.thread_number}-${thread.id}.txt`;

  return {
    userDir,
    fullPath: path.join(userDir, filename),
  };
}

async function syncServerSideHistory(thread) {
  if (! await settings.isServerSideHistoryEnabled()) {
    return null;
  }

  const threadMessages = await thread.getThreadMessages();
  const formatLogResult = await formatters.formatLog(thread, threadMessages, {
    simple: true,
    verbose: false,
  });

  const { userDir, fullPath } = getThreadHistoryPath(thread);
  fs.mkdirSync(userDir, { recursive: true });
  fs.writeFileSync(fullPath, formatLogResult.content, { encoding: "utf8" });

  return fullPath;
}

module.exports = {
  getServerSideHistoryBaseDir,
  getThreadHistoryPath,
  syncServerSideHistory,
};
