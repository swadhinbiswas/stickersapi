/**
 * StickersAPI SDK
 *
 * Zero-dependency client for https://stickerapi.sbs.
 * Works in Node 18+, browsers, Cloudflare Workers, Bun and Deno.
 */

export interface StickersAPIOptions {
  /** API origin. Defaults to https://stickerapi.sbs */
  baseUrl?: string;
  /** Custom fetch implementation (optional). */
  fetch?: typeof fetch;
}

export interface Uploader {
  name: string;
  url: string | null;
}

export interface StickerListItem {
  slug: string;
  name: string;
  image: string | null;
  downloads: number | null;
  type: string | null;
  page: string;
  preview: string;
  download: string;
}

export interface Sticker {
  kind: 'sticker';
  slug: string;
  name: string;
  description: string | null;
  image: string;
  file: string;
  type: string | null;
  mimeType: string | null;
  size: string | null;
  dimensions: string | null;
  downloads: number | null;
  added: string | null;
  stickerId: string | null;
  uploader: Uploader | null;
  tags: string[];
  botCommand: string | null;
  page: string | null;
  preview: string;
  download: string;
  embed: string;
  related: StickerListItem[];
}

export interface PackSticker {
  file: string;
  image: string;
  preview: string;
  download: string;
}

export interface Pack {
  kind: 'pack';
  slug: string;
  name: string;
  description: string | null;
  stickers: PackSticker[];
  count: number;
  downloads: number | null;
  added: string | null;
  uploader: Uploader | null;
  tags: string[];
  page: string | null;
  downloadUrl: string;
  zipName: string;
}

export interface PackListItem {
  slug: string;
  name: string;
  count: number;
  previews: string[];
  page: string;
  download: string;
}

export interface StickerListing {
  tag: string;
  sort: string | null;
  page: number;
  nextPage: number | null;
  source: string;
  items: StickerListItem[];
}

export interface PackListing {
  tag: string;
  page: number;
  nextPage: number | null;
  source: string;
  items: PackListItem[];
}

export interface Emote {
  source: '7tv' | 'bttv' | 'ffz';
  id: string;
  name: string;
  type: string;
  animated: boolean;
  width: number;
  height: number;
  image: string;
  preview: string;
  page: string | null;
}

export interface EmoteList {
  source: 'all' | '7tv' | 'bttv' | 'ffz';
  q: string | null;
  count: number;
  items: Emote[];
  unavailable: string[];
}

export interface TelegramSticker {
  fileId: string;
  fileUniqueId: string | null;
  emoji: string | null;
  type: string;
  width: number | null;
  height: number | null;
  isAnimated: boolean;
  isVideo: boolean;
  fileSize: number | null;
  thumbnailFileId: string | null;
  preview: string;
  download: string;
}

export interface TelegramSet {
  source: 'telegram';
  name: string;
  title: string;
  stickerType: string;
  count: number;
  stickers: TelegramSticker[];
}

export interface PfpItem {
  kind: 'pfp' | 'banner';
  slug: string;
  name: string;
  image: string;
  page: string;
  api: string;
  preview: string;
  download: string;
}

export interface PfpDetail extends PfpItem {
  description: string | null;
  author: string | null;
  related: PfpItem[];
}

export interface PfpListing {
  kind: 'pfps' | 'banners';
  tag: string;
  sort: string | null;
  page: number;
  nextPage: number | null;
  source: string;
  items: PfpItem[];
}

export type PfpSort = 'featured' | 'latest' | 'oldest' | 'downloads' | 'recent';
export type StickerSort = 'latest' | 'oldest' | 'downloads' | 'recent';

export class StickersAPIError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'StickersAPIError';
    this.status = status;
    this.body = body;
  }
}

type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

function buildQuery(query?: Query): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}

export class StickersAPI {
  readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: StickersAPIOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'https://stickerapi.sbs').replace(/\/+$/, '');
    const impl = options.fetch ?? globalThis.fetch;
    if (typeof impl !== 'function') {
      throw new TypeError('No fetch implementation available. Pass options.fetch.');
    }
    // Bind the browser fetch implementation; calling it as a class method
    // throws "Illegal invocation".
    this.fetchImpl = impl.bind(globalThis);
  }

  /** Turn an API-relative path into an absolute URL. */
  absolute(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  private async request<T>(path: string, init?: RequestInit & { query?: Query }): Promise<T> {
    const url = `${this.baseUrl}${path}${buildQuery(init?.query)}`;
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
    const res = await this.fetchImpl(url, {
      method: init?.method ?? 'GET',
      headers,
      body: init?.body,
      signal: init?.signal,
    });
    const type = res.headers.get('content-type') ?? '';
    const body: unknown = type.includes('application/json') ? await res.json().catch(() => null) : await res.text();
    if (!res.ok) {
      const message =
        body && typeof body === 'object' && 'error' in body
          ? String((body as { error: unknown }).error)
          : `StickersAPI request failed with ${res.status} ${res.statusText}`;
      throw new StickersAPIError(res.status, message, body);
    }
    return body as T;
  }

  // Meta
  getEndpointIndex(): Promise<Record<string, unknown>> {
    return this.request('/api');
  }

  health(): Promise<{ status: string; runtime: string }> {
    return this.request('/api/health');
  }

  sources(): Promise<Record<string, unknown>> {
    return this.request('/api/sources');
  }

  // Stickers
  listStickers(params: {
    tag?: string;
    sort?: StickerSort;
    page?: number;
    random?: boolean;
    count?: number;
  } = {}): Promise<StickerListing> {
    return this.request('/api/stickers', { query: params });
  }

  getSticker(slug: string): Promise<Sticker> {
    return this.request(`/api/sticker/${encodeURIComponent(slug)}`);
  }

  randomSticker(): Promise<Sticker> {
    return this.request('/api/sticker/random');
  }

  randomStickers(count = 20): Promise<{ random: true; count: number; items: StickerListItem[] }> {
    return this.request('/api/stickers/random', { query: { count } });
  }

  search(q: string, limit = 50): Promise<{ q: string; source: string; limit: number; count: number; items: StickerListItem[] }> {
    return this.request('/api/search', { query: { q, limit } });
  }

  stickerPreviewUrl(slug: string): string {
    return this.absolute(`/api/sticker/${encodeURIComponent(slug)}/preview`);
  }

  stickerDownloadUrl(slug: string): string {
    return this.absolute(`/api/sticker/${encodeURIComponent(slug)}/download`);
  }

  stickerEmbedUrl(slug: string): string {
    return this.absolute(`/api/sticker/${encodeURIComponent(slug)}/embed`);
  }

  // Packs
  listPacks(params: { tag?: string; page?: number; random?: boolean; count?: number } = {}): Promise<PackListing> {
    return this.request('/api/packs', { query: params });
  }

  getPack(slug: string): Promise<Pack> {
    return this.request(`/api/pack/${encodeURIComponent(slug)}`);
  }

  randomPack(): Promise<Pack> {
    return this.request('/api/pack/random');
  }

  randomPacks(count = 5): Promise<{ random: true; count: number; items: PackListItem[] }> {
    return this.request('/api/packs/random', { query: { count } });
  }

  packZipUrl(slug: string): string {
    return this.absolute(`/api/pack/${encodeURIComponent(slug)}/download`);
  }

  // Files
  filePreviewUrl(file: string): string {
    return this.absolute(`/api/file/${encodeURIComponent(file)}/preview`);
  }

  fileDownloadUrl(file: string): string {
    return this.absolute(`/api/file/${encodeURIComponent(file)}/download`);
  }

  // Emotes
  listEmotes(params: { source?: 'all' | '7tv' | 'bttv' | 'ffz'; q?: string; limit?: number } = {}): Promise<EmoteList> {
    return this.request('/api/emotes', { query: params });
  }

  emotePreviewUrl(source: string, id: string): string {
    return this.absolute(`/api/emote/${encodeURIComponent(source)}/${encodeURIComponent(id)}/preview`);
  }

  emoteDownloadUrl(source: string, id: string): string {
    return this.absolute(`/api/emote/${encodeURIComponent(source)}/${encodeURIComponent(id)}/download`);
  }

  // Telegram
  getTelegramSet(name: string): Promise<TelegramSet> {
    return this.request(`/api/telegram/stickers/${encodeURIComponent(name)}`);
  }

  telegramFilePreviewUrl(id: string): string {
    return this.absolute(`/api/telegram/file/${encodeURIComponent(id)}/preview`);
  }

  telegramFileDownloadUrl(id: string): string {
    return this.absolute(`/api/telegram/file/${encodeURIComponent(id)}/download`);
  }

  // PFPs
  listPfps(params: { tag?: string; page?: number; sort?: PfpSort } = {}): Promise<PfpListing> {
    return this.request('/api/pfps', { query: params });
  }

  listPfpsByTag(tag: string, params: { page?: number; sort?: PfpSort } = {}): Promise<PfpListing> {
    return this.request(`/api/pfps/${encodeURIComponent(tag)}`, { query: params });
  }

  getPfp(slug: string): Promise<PfpDetail> {
    return this.request(`/api/pfp/${encodeURIComponent(slug)}`);
  }

  pfpPreviewUrl(slug: string): string {
    return this.absolute(`/api/pfp/${encodeURIComponent(slug)}/preview`);
  }

  pfpDownloadUrl(slug: string): string {
    return this.absolute(`/api/pfp/${encodeURIComponent(slug)}/download`);
  }

  // Banners
  listBanners(params: { tag?: string; page?: number; sort?: PfpSort } = {}): Promise<PfpListing> {
    return this.request('/api/banners', { query: params });
  }

  listBannersByTag(tag: string, params: { page?: number; sort?: PfpSort } = {}): Promise<PfpListing> {
    return this.request(`/api/banners/${encodeURIComponent(tag)}`, { query: params });
  }

  getBanner(slug: string): Promise<PfpDetail> {
    return this.request(`/api/banner/${encodeURIComponent(slug)}`);
  }

  bannerPreviewUrl(slug: string): string {
    return this.absolute(`/api/banner/${encodeURIComponent(slug)}/preview`);
  }

  bannerDownloadUrl(slug: string): string {
    return this.absolute(`/api/banner/${encodeURIComponent(slug)}/download`);
  }

  // Collections
  createCollectionZip(files: string[], signal?: AbortSignal): Promise<Response> {
    return this.fetchImpl(this.absolute('/api/collection/zip'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ files }),
      signal,
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body && typeof body === 'object' && 'error' in body
            ? String((body as { error: unknown }).error)
            : `ZIP request failed with ${res.status} ${res.statusText}`;
        throw new StickersAPIError(res.status, message, body);
      }
      return res;
    });
  }
}

export default StickersAPI;
