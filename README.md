# MacPaw Mod Mail

This repository is a MacPaw deployment fork of [Dragory/modmailbot](https://github.com/Dragory/modmailbot).
It stays close to upstream and adds production scaffolding for a VPS + PM2 deployment without committing secrets.

## MacPaw-specific additions

- `.env.example` for environment-variable based configuration
- `docs/macpaw-vps-deploy.md` with VPS deployment notes
- PM2 process metadata renamed for the `macpawmodmail` app
- Package metadata renamed for the MacPaw fork

## Quick start

1. Copy `.env.example` to `.env`
2. Fill in your Discord bot token and Discord IDs
3. Run `npm ci`
4. Start the bot with `pm2 start modmailbot-pm2.json` or `npm start`

## Upstream documentation

- **[🛠️ Setting up the bot](docs/setup.md)**
- **[✨ Updating the bot](docs/updating.md)**
- **[🙋 Frequently Asked Questions](docs/faq.md)**
- [📝 Configuration](docs/configuration.md)
- [🤖 Commands](docs/commands.md)
- [📋 Snippets](docs/snippets.md)
- [🧩 Plugins](docs/plugins.md)
- [📌 Release notes](CHANGELOG.md)
- [📚 Community Guides & Resources](https://github.com/Dragory/modmailbot-community-resources)

## Upstream support

If you need help with the base project, the upstream support server is here:

- [Join support server](https://discord.gg/vRuhG9R)
