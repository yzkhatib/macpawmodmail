# MacPaw VPS deploy

This fork is set up to run as a standalone Node.js app on a VPS with one shared system Node installation and one shared PM2 daemon.

## Recommended layout

- App path: `/home/yazan/bots/macpawmodmail`
- Process manager: PM2 under the `yazan` user
- Node runtime: system-wide Node.js 18 LTS
- Install command: `npm ci --omit=dev`

This avoids extra global package installs while keeping each bot's application dependencies isolated to its own project directory.

## First deploy

1. Clone the repo into `/home/yazan/bots/macpawmodmail`
2. Copy `.env.example` to `.env`
3. Fill in the Discord bot token and the required Discord IDs
4. Run `npm ci --omit=dev`
5. Start the app with `pm2 start modmailbot-pm2.json`
6. Persist the PM2 process list with `pm2 save`

## Discord-side requirements

Before the bot can actually handle modmail, the bot application must:

- be invited to the target Discord server
- have `View Channels`, `Send Messages`, `Manage Channels`, `Manage Messages`, `Embed Links`, `Attach Files`, and `Read Message History`
- have access to the staff category used for new thread channels
- have access to the log channel and attachment storage channel configured in `.env`

## Updates

From `/home/yazan/bots/macpawmodmail`:

```bash
git pull
npm ci --omit=dev
pm2 restart macpawmodmail
pm2 save
```

## Notes

- The app still supports `config.ini`, but `.env` is cleaner for VPS deploys and keeps secrets out of git.
- SQLite is the default database backend and stores data under `db/data.sqlite`.
- If you change configuration values, restart the PM2 process.
