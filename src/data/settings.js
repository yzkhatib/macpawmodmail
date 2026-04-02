const moment = require("moment");

const knex = require("../knex");

const SERVER_SIDE_HISTORY_ENABLED_KEY = "serverSideHistoryEnabled";

async function getSetting(key) {
  const row = await knex("settings")
    .where("key", key)
    .first();

  return row ? row.value : null;
}

async function setSetting(key, value) {
  const payload = {
    key,
    value,
    updated_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  };

  const existing = await getSetting(key);
  if (existing == null) {
    await knex("settings").insert(payload);
    return;
  }

  await knex("settings")
    .where("key", key)
    .update(payload);
}

async function isServerSideHistoryEnabled() {
  const value = await getSetting(SERVER_SIDE_HISTORY_ENABLED_KEY);
  return value === "on";
}

async function setServerSideHistoryEnabled(enabled) {
  await setSetting(SERVER_SIDE_HISTORY_ENABLED_KEY, enabled ? "on" : "off");
}

module.exports = {
  getSetting,
  setSetting,
  isServerSideHistoryEnabled,
  setServerSideHistoryEnabled,
};
