# StickersAPI SDK

Zero-dependency TypeScript client for [StickersAPI](https://stickerapi.sbs). Package: [`stickersapi`](https://www.npmjs.com/package/stickersapi).

Covers: stickers.gg stickers and packs, 7TV/BTTV/FFZ emotes, Telegram sticker sets, and pfps.gg profile pictures and banners.

Works in Node 18+, browsers, Cloudflare Workers, Bun and Deno.

## Install

From this repository:

```bash
cd sdk
npm install
npm run build
```

Then in another project:

```bash
npm install /path/to/stickersapi/sdk
```

Install from npm:

```bash
npm install stickersapi
```

## Quick start

```ts
import { StickersAPI } from 'stickersapi';

const api = new StickersAPI();

const sticker = await api.getSticker('4238-cat-pee');
console.log(sticker.name, api.stickerDownloadUrl(sticker.slug));

const pack = await api.getPack('7214-best-pepe-pack');
console.log(pack.count, api.packZipUrl(pack.slug));

const pfps = await api.listPfps({ tag: 'anime', page: 1 });
console.log(pfps.items[0].name);
```

## Common calls

```ts
// Stickers
await api.listStickers({ tag: 'cat', sort: 'downloads', page: 1 });
await api.search('cute cat', 10);
await api.randomSticker();
await api.randomStickers(5);

// Packs
await api.listPacks({ tag: 'pepe', page: 1 });
await api.randomPack();

// Emotes
await api.listEmotes({ source: 'all', q: 'cat', limit: 10 });
api.emotePreviewUrl('7tv', '01FCY771D800007PQ2DF3GDTN6');

// Telegram
const set = await api.getTelegramSet('UtyaDuck');
api.telegramFileDownloadUrl(set.stickers[0].fileId);

// PFPs and banners
await api.listPfpsByTag('matching');
await api.getPfp('11334-cat');
await api.listBanners({ tag: 'anime' });
await api.getBanner('24766-254701-tsuki');

// Custom ZIP
const zip = await api.createCollectionZip(['2223-charlie.png', '8139-shocked-cat.jpg']);
const bytes = new Uint8Array(await zip.arrayBuffer());
```

## URLs

The API returns relative image routes. Use the helpers to make them absolute:

```ts
api.stickerPreviewUrl('4238-cat-pee');
api.stickerDownloadUrl('4238-cat-pee');
api.packZipUrl('7214-best-pepe-pack');
api.pfpDownloadUrl('11334-cat');
api.bannerPreviewUrl('24766-254701-tsuki');
```

## Custom server

Point the SDK at a self-hosted or custom deployment:

```ts
const api = new StickersAPI({ baseUrl: 'https://stickers.example.com' });
```

Pass a custom fetch for tests or non-standard runtimes:

```ts
const api = new StickersAPI({ fetch: myFetch });
```

## Errors

Failed requests throw `StickersAPIError` with `status`, `message` and the parsed `body`:

```ts
import { StickersAPIError } from 'stickersapi';

try {
  await api.getSticker('missing');
} catch (err) {
  if (err instanceof StickersAPIError && err.status === 404) {
    console.log('Not found');
  }
}
```

## Types

The package ships types for `Sticker`, `Pack`, `StickerListItem`, `PackListItem`, `Emote`, `TelegramSet`, `PfpItem`, `PfpDetail` and more.

## Repository

<https://github.com/swadhinbiswas/stickersapi>

## Discord bot example

See [`examples/discord-bot`](../examples/discord-bot) for a complete `/sticker`, `/pack`, `/pfp` and `/banner` bot using discord.js.

## License

MIT. StickersAPI is unofficial and not affiliated with stickers.gg, Discord, Telegram or pfps.gg.
