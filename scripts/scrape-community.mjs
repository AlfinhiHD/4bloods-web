// Community data scraper -> src/data/community/*.json
// Usage: node scripts/scrape-community.mjs [--max-videos=500]
// Each source is isolated: one failure never blocks the others. Output carries
// `status` + `scrapedAt` so the UI can show stale/unavailable states honestly.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'community');
const MAX_VIDEOS = Number((process.argv.find((a) => a.startsWith('--max-videos=')) || '').split('=')[1]) || 500;

const SOURCES = {
  youtubeHandle: '@4blood-plug',
  instagram: '4bloodmedia',
  tiktok: '4bloodmedia',
  linktree: '4bloods',
};
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'CONSENT=YES+1; SOCS=CAI' };

const get = async (url, init = {}) => {
  const res = await fetch(url, { ...init, headers: { ...HEADERS, ...init.headers }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
};
const meta = (html, prop) =>
  html.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`, 'i'))?.[1]
    ?.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
const num = (s) => {
  if (!s) return null;
  const m = String(s).replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  return Math.round(parseFloat(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] || 1));
};
const walk = (node, fn) => {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
  if (node && typeof node === 'object') {
    fn(node);
    Object.values(node).forEach((n) => walk(n, fn));
  }
};
const extractJson = (html, marker) => {
  const i = html.indexOf(marker);
  if (i < 0) return null;
  const start = html.indexOf('{', i);
  let depth = 0, inStr = false, esc = false;
  for (let j = start; j < html.length; j++) {
    const c = html[j];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(html.slice(start, j + 1));
  }
  return null;
};

// ---------- YouTube: channel info + paginated video list via innertube ----------
async function scrapeYouTube() {
  const html = await (await get(`https://www.youtube.com/${SOURCES.youtubeHandle}/videos`)).text();
  const data = extractJson(html, 'var ytInitialData');
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1];
  const channelId = (html.match(/"(?:channelId|externalId|browseId)":"(UC[\w-]{22})"/) || html.match(/channel\/(UC[\w-]{22})/))?.[1];
  if (!data) throw new Error('ytInitialData not found');

  const channel = { handle: SOURCES.youtubeHandle, channelId, url: `https://www.youtube.com/${SOURCES.youtubeHandle}` };
  channel.title = meta(html, 'og:title');
  channel.description = meta(html, 'og:description');
  walk(data, (n) => {
    // Subscriber / video counts live in header metadata rows ("1.2K subscribers", "45 videos")
    for (const t of [n.content, n.simpleText].filter((x) => typeof x === 'string')) {
      if (/subscribers?$/i.test(t) && !channel.subscribersText) channel.subscribersText = t;
      if (/^[\d.,KMB]+ videos?$/i.test(t) && !channel.videoCountText) channel.videoCountText = t;
    }
  });
  channel.subscribers = num(channel.subscribersText);
  channel.videoCount = num(channel.videoCountText);

  const videos = new Map();
  let token = null;
  const collect = (root) => {
    walk(root, (n) => {
      const v = n.videoRenderer || n.lockupViewModel; // legacy | new layout
      if (n.videoRenderer) {
        const r = n.videoRenderer;
        videos.set(r.videoId, {
          id: r.videoId,
          title: r.title?.runs?.[0]?.text,
          published: r.publishedTimeText?.simpleText || null,
          views: r.viewCountText?.simpleText || null,
          duration: r.lengthText?.simpleText || null,
          isLive: Boolean(r.badges?.some((b) => /LIVE/i.test(b.metadataBadgeRenderer?.style || ''))),
        });
      } else if (n.lockupViewModel?.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
        const l = n.lockupViewModel;
        const rows = l.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
        const parts = rows.flatMap((r) => r.metadataParts?.map((p) => p.text?.content) || []);
        videos.set(l.contentId, {
          id: l.contentId,
          title: l.metadata?.lockupMetadataViewModel?.title?.content,
          views: parts.find((p) => /views?$/i.test(p || '')) || null,
          published: parts.find((p) => /ago$/i.test(p || '')) || null,
          duration: JSON.stringify(l).match(/"text":"(\d+:\d{2}(?::\d{2})?)"/)?.[1] || null,
        });
      }
      if (n.continuationItemRenderer) token = n.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || token;
    });
  };
  collect(data);

  while (token && videos.size < MAX_VIDEOS && apiKey) {
    const cur = token;
    token = null;
    const res = await get(`https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion, hl: 'en' } }, continuation: cur }),
    });
    const before = videos.size;
    collect(await res.json());
    if (videos.size === before) break;
  }
  // RSS = latest 15 with exact publish date + views (innertube gives relative dates only)
  if (channelId) {
    try {
      const xml = await (await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)).text();
      for (const e of xml.split('<entry>').slice(1)) {
        const id = e.match(/<yt:videoId>([^<]+)/)?.[1];
        const v = videos.get(id);
        if (!v) continue;
        v.publishedAt = e.match(/<published>([^<]+)/)?.[1] || null;
        v.viewCount = Number(e.match(/<media:statistics views="(\d+)"/)?.[1]) || null;
      }
    } catch {}
  }
  for (const v of videos.values()) v.thumb = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
  return { channel, videos: [...videos.values()].slice(0, MAX_VIDEOS) };
}

// ---------- Instagram: public og:description only (counts). Posts need login/API. ----------
async function scrapeInstagram() {
  const CRAWLER_UAS = [UA, 'facebookexternalhit/1.1', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'];
  let m;
  for (const ua of CRAWLER_UAS) {
    const html = await (await get(`https://www.instagram.com/${SOURCES.instagram}/`, { headers: { 'User-Agent': ua } })).text();
    const desc = meta(html, 'og:description') || meta(html, 'description') || '';
    m = desc.match(/([\d.,KMB]+)\s*Followers?,\s*([\d.,KMB]+)\s*Following,\s*([\d.,KMB]+)\s*Posts?/i);
    if (m) break;
  }
  if (!m) throw new Error('profile counts not found (login wall?)');
  return {
    handle: SOURCES.instagram,
    url: `https://www.instagram.com/${SOURCES.instagram}/`,
    followers: num(m[1]), following: num(m[2]), posts: num(m[3]),
    note: 'Latest posts are not publicly scrapable without login; use manual `featuredPosts` in community.json.',
  };
}

// ---------- TikTok: SSR state if present, else report blocked ----------
async function scrapeTikTok() {
  const html = await (await get(`https://www.tiktok.com/@${SOURCES.tiktok}`)).text();
  const state = extractJson(html, '__UNIVERSAL_DATA_FOR_REHYDRATION__');
  const stats = state?.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo;
  if (!stats) throw new Error('profile state missing (bot challenge / JS-only shell)');
  return {
    handle: SOURCES.tiktok,
    url: `https://www.tiktok.com/@${SOURCES.tiktok}`,
    followers: stats.stats.followerCount, likes: stats.stats.heartCount, videos: stats.stats.videoCount,
  };
}

// ---------- Linktree + Discord invite (public API, gives member counts) ----------
async function scrapeLinktree() {
  const html = await (await get(`https://linktr.ee/${SOURCES.linktree}`)).text();
  const links = [...html.matchAll(/<a href="(https?:[^"]+)" aria-label="([^"]*)"/g)]
    .map((m) => ({ label: m[2].trim(), url: m[1].replace(/&amp;/g, '&').replace('http://', 'https://') }))
    .filter((l) => !/^https:\/\/linktr\.ee\//.test(l.url));
  if (!links.length) throw new Error('no links parsed');
  return { url: `https://linktr.ee/${SOURCES.linktree}`, links };
}

async function scrapeDiscord(links) {
  const invite = links.find((l) => /discord\.(gg|com\/invite)\//.test(l.url))?.url;
  if (!invite) throw new Error('no discord invite in linktree');
  const code = invite.split('/').pop().split('?')[0];
  const j = await (await get(`https://discord.com/api/v10/invites/${code}?with_counts=true&with_expiration=true`)).json();
  return {
    invite, guildName: j.guild?.name, description: j.guild?.description || null,
    members: j.approximate_member_count, online: j.approximate_presence_count, expiresAt: j.expires_at,
  };
}

const run = async (name, fn) => {
  const scrapedAt = new Date().toISOString();
  try {
    const data = await fn();
    console.log(`ok   ${name}`);
    return { status: 'ok', scrapedAt, ...data };
  } catch (e) {
    console.warn(`FAIL ${name}: ${e.message}`);
    return { status: 'error', scrapedAt, error: e.message };
  }
};

await mkdir(OUT, { recursive: true });
const linktree = await run('linktree', scrapeLinktree);
const results = {
  youtube: await run('youtube', scrapeYouTube),
  instagram: await run('instagram', scrapeInstagram),
  tiktok: await run('tiktok', scrapeTikTok),
  linktree,
  discord: await run('discord', () => scrapeDiscord(linktree.links || [])),
};
for (const [k, v] of Object.entries(results)) {
  await writeFile(join(OUT, `${k}.json`), JSON.stringify(v, null, 2) + '\n');
}
console.log(`written -> ${OUT}`);
