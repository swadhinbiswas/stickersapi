# StickersAPI

Official TypeScript SDK, Discord bot example and OpenAPI spec for [StickersAPI](https://stickerapi.sbs/), a free sticker, emote, Telegram and PFP API.

[Website](https://stickerapi.sbs/) · [Documentation](https://stickerapi.sbs/docs) · [Interactive Reference](https://stickerapi.sbs/reference) · [Tools](https://stickerapi.sbs/tools) · [SDK page](https://stickerapi.sbs/sdk) · [PFPs](https://stickerapi.sbs/pfps) · [Banners](https://stickerapi.sbs/banners)

> StickersAPI is unofficial and not affiliated with stickers.gg, Discord, Telegram or pfps.gg. All sticker, emote, PFP and banner content belongs to its uploaders and creators. The hosted API and production server code are not part of this repository.

## Contents

| Path | What it is |
|---|---|
| `sdk/` | Zero-dependency TypeScript SDK for the public API |
| `examples/discord-bot/` | Complete discord.js v14 bot with `/sticker`, `/pack`, `/random`, `/pfp` and `/banner` |
| `openapi.json` | OpenAPI 3.1 document for every public endpoint |
| `.github/workflows/ci.yml` | Builds the SDK and syntax-checks the bot |

## SDK quick start

From this repository:

```bash
git clone https://github.com/swadhinbiswas/stickersapi.git
cd stickersapi/sdk
npm install
npm run build
```

Use it in another project:

```bash
npm install /path/to/stickersapi/sdk
```

When the package is published to npm:

```bash
npm install @stickerapi/sdk
```

```ts
import { StickersAPI } from '@stickerapi/sdk';

const api = new StickersAPI();
const sticker = await api.getSticker('4238-cat-pee');

console.log(sticker.name);
console.log(api.stickerDownloadUrl(sticker.slug));
```

You can also import the built module directly from the site:

```js
import { StickersAPI } from 'https://stickerapi.sbs/sdk-assets/stickersapi-sdk.js';
```

The SDK covers stickers, packs, search, random items, 7TV/BTTV/FFZ emotes, Telegram sets, PFPs, banners and custom ZIP collections. See [`sdk/README.md`](sdk/README.md) for the full method list and types.

## Discord bot example

The bot is ready to run:

```bash
cd examples/discord-bot
npm install
cp .env.example .env
# fill in DISCORD_TOKEN and DISCORD_CLIENT_ID
npm start
```

Commands:

- `/sticker query:<slug or text>`
- `/pack slug:<pack>`
- `/random`
- `/pfp slug:<pfp>`
- `/banner slug:<banner>`

See [`examples/discord-bot/README.md`](examples/discord-bot/README.md) for the Discord application setup, invite scopes and deployment notes.

## OpenAPI

The spec is at [`openapi.json`](openapi.json), and the live copy is at <https://stickerapi.sbs/openapi.json>.

It describes all 35 operations, including stickers, packs, files, search, collections, emotes, Telegram, PFPs and banners. You can test every one in the [interactive reference](https://stickerapi.sbs/reference).

## API at a glance

```bash
# Health
curl -s https://stickerapi.sbs/api/health

# Sticker metadata
curl -s https://stickerapi.sbs/api/sticker/4238-cat-pee

# Search
curl -s "https://stickerapi.sbs/api/search?q=cute%20cat&limit=10"

# PFP listing
curl -s "https://stickerapi.sbs/api/pfps?tag=anime&page=1"

# Telegram set
curl -s https://stickerapi.sbs/api/telegram/stickers/UtyaDuck
```

No API keys. CORS is open. The API is read-only and cached at the edge.

## Development

```bash
# SDK
cd sdk
npm ci
npm run build

# Bot syntax check
node --check examples/discord-bot/index.js
```

The repository includes a GitHub Actions workflow for both checks.

## Security

Do not open a public issue for a vulnerability. Email <mail@stickerapi.sbs> and see [`SECURITY.md`](SECURITY.md).

Never commit `.env`, `.dev.vars`, tokens, Redis credentials or Cloudflare secrets.

## License

The SDK, Discord bot example and OpenAPI document are MIT licensed. The hosted service and production server code are separate and are not licensed by this repository.

Stickers, emotes, PFPs and banners remain the property of their uploaders and creators.
