# StickersAPI demo Discord bot

A complete discord.js v14 bot that uses the free StickersAPI. It supports stickers, packs, random stickers, PFPs and banners.

## Commands

- `/sticker query:<slug or text>` - fetch a sticker by slug, or search and show the top 5.
- `/pack slug:<pack>` - show a pack, its preview and a ZIP button when the pack is small enough.
- `/random` - show a random sticker.
- `/pfp slug:<pfp>` - show a Discord PFP with download and page links.
- `/banner slug:<banner>` - show a Discord banner with download and page links.

## Setup

1. Create an application at <https://discord.com/developers/applications>.
2. Open **Bot**, create the bot and copy the token.
3. Copy the application ID from **General Information**.
4. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `DISCORD_CLIENT_ID`.
5. Optional: set `GUILD_ID` for instant command registration during development.
6. Invite the bot with the `bot` and `applications.commands` scopes. It needs **Send Messages**, **Embed Links** and **Attach Files**.
7. Install and start:

```bash
npm install
npm start
```

Commands are registered on startup. Guild commands appear instantly; global commands can take up to an hour.

## Environment

```bash
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
GUILD_ID=          # optional
API_BASE=https://stickerapi.sbs
```

`API_BASE` can point at a self-hosted or custom StickersAPI deployment.

## Deploy

Any Node host works: a VPS, Railway, Fly.io, Render, or a container. Keep the bot process alive and never commit `.env`.

For a public bot:

- Add a privacy policy and terms link in your bot profile.
- Add the commands to the bot description.
- List it on top.gg and discord.bots.gg after testing.
- Use a sharding manager only after the bot is in many guilds.

## Using the SDK

This example uses plain `fetch` so it is easy to copy. For typed calls, see the SDK in `../../sdk` and the page at <https://stickerapi.sbs/sdk>.

## License

MIT. StickersAPI is unofficial and not affiliated with stickers.gg, Discord, Telegram or pfps.gg.
