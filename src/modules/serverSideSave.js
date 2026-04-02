const settings = require("../data/settings");
const threads = require("../data/threads");
const { syncServerSideHistory } = require("../data/serverSideHistory");
const utils = require("../utils");

const EPHEMERAL = 64;
const COMMAND_NAME = "serversidesave";

module.exports = ({ bot, config, commands }) => {
  const hasTogglePermission = member => {
    if (! member || ! config.serverSideSaveToggleRoleId) {
      return false;
    }

    return member.roles.includes(config.serverSideSaveToggleRoleId);
  };

  const applyMode = async mode => {
    const enabled = mode === "on";
    await settings.setServerSideHistoryEnabled(enabled);

    if (enabled) {
      const openThreads = await threads.getAllOpenThreads();
      for (const thread of openThreads) {
        try {
          await syncServerSideHistory(thread);
        } catch (err) {
          console.error(`[WARN] Failed to sync server-side history for thread ${thread.id}: ${err.message}`);
        }
      }
    }

    return enabled
      ? "Messages are saved server-side."
      : "Messages are not saved server-side.";
  };

  const parseMode = input => {
    const mode = String(input || "").trim().toLowerCase();
    return (mode === "on" || mode === "off") ? mode : null;
  };

  commands.addInboxServerCommand("server side save", "<mode:string>", async (msg, args) => {
    if (! hasTogglePermission(msg.member)) {
      utils.postError(msg.channel, "Only members with the Moderator role can toggle server-side saving.");
      return;
    }

    const mode = parseMode(args.mode);
    if (! mode) {
      msg.channel.createMessage(`Usage: \`${config.prefix}server side save on\` or \`${config.prefix}server side save off\``);
      return;
    }

    const response = await applyMode(mode);
    msg.channel.createMessage(response);
  }, {
    aliases: ["serversidesave", "server-side-save"],
  });

  bot.on("ready", async () => {
    try {
      const commandDefinition = {
        name: COMMAND_NAME,
        description: "Toggle server-side transcript exports",
        options: [
          {
            type: 3,
            name: "mode",
            description: "Enable or disable server-side transcript exports",
            required: true,
            choices: [
              { name: "on", value: "on" },
              { name: "off", value: "off" },
            ],
          },
        ],
      };

      const existingCommands = await bot.getGuildCommands(config.inboxServerId);
      const existing = existingCommands.find(cmd => cmd.name === COMMAND_NAME);

      if (existing) {
        await bot.editGuildCommand(config.inboxServerId, existing.id, commandDefinition);
      } else {
        await bot.createGuildCommand(config.inboxServerId, commandDefinition);
      }
    } catch (err) {
      console.error(`[WARN] Failed to register /${COMMAND_NAME}: ${err.message}`);
    }
  });

  bot.on("interactionCreate", async interaction => {
    if (! interaction.data || interaction.data.name !== COMMAND_NAME) {
      return;
    }

    if (interaction.guildID !== config.inboxServerId) {
      await interaction.createMessage({
        content: "This command can only be used in the inbox server.",
        flags: EPHEMERAL,
      });
      return;
    }

    if (! hasTogglePermission(interaction.member)) {
      await interaction.createMessage({
        content: "Only members with the Moderator role can toggle server-side saving.",
        flags: EPHEMERAL,
      });
      return;
    }

    const modeOption = (interaction.data.options || []).find(opt => opt.name === "mode");
    const mode = parseMode(modeOption && modeOption.value);
    if (! mode) {
      await interaction.createMessage({
        content: "Use `on` or `off`.",
        flags: EPHEMERAL,
      });
      return;
    }

    const response = await applyMode(mode);
    await interaction.createMessage({
      content: response,
      flags: EPHEMERAL,
    });
  });
};
