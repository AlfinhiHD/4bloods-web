import fs from 'fs';
import path from 'path';

const ROSTER_PATH = path.resolve(process.cwd(), 'src/data/roster.json');
const roster = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));

console.log(`[Enricher] Loaded ${roster.length} streamers from roster.`);

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchChannelData(streamer) {
  const { channelId, handle, name } = streamer;
  const url = handle
    ? `https://www.youtube.com/${handle}`
    : `https://www.youtube.com/channel/${channelId}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'en-US,en;q=0.9',
        Cookie: 'CONSENT=YES+1',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[Failed ${res.status}] ${name} (${url})`);
      return streamer;
    }

    const html = await res.text();

    // 1. Extract Subscriber Count strictly prioritizing channel header
    let subText = null;
    let subNumber = null;

    const subRegexes = [
      /"metadataParts":\[\{"text":\{"content":"([\d.,KMB]+\s+subscribers?)"/i,
      /"content":"([\d.,KMB]+\s+subscribers?)"/i,
      /"c4TabbedHeaderRenderer":\{[\s\S]*?"subscriberCountText":\{[\s\S]*?"simpleText":"([^"]+)"/,
      /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}\},"simpleText":"([^"]+)"\}/,
      /"subscriberCountText":\{"simpleText":"([^"]+)"\}/,
    ];
    for (const r of subRegexes) {
      const m = html.match(r);
      if (m) {
        subText = (m[1] || m[2] || m[0]).trim();
        break;
      }
    }

    if (subText) {
      const clean = subText.replace(/subscribers?/i, '').trim();
      const numMatch = clean.match(/([\d.,]+)\s*([KMB])?/i);
      if (numMatch) {
        const val = parseFloat(numMatch[1].replace(/,/g, ''));
        const unit = (numMatch[2] || '').toUpperCase();
        const multiplier =
          unit === 'M' ? 1000000 : unit === 'K' ? 1000 : unit === 'B' ? 1000000000 : 1;
        subNumber = Math.round(val * multiplier);
      }
    }

    // 2. Extract Channel Banner URL
    let banner = streamer.banner || null;
    const bannerMatch = html.match(
      /"banner":\{"imageBannerViewModel":\{"image":\{"sources":\[\{"url":"([^"]+)"/
    );
    if (bannerMatch) {
      banner = bannerMatch[1];
    } else {
      const fallbackBanner = html.match(
        /"(?:banner|tvBanner|mobileBanner)":\{"thumbnails":\[\{"url":"([^"]+)"/
      );
      if (fallbackBanner) banner = fallbackBanner[1];
    }

    // 3. Extract Channel Avatar (if better/newer)
    let avatar = streamer.avatar;
    const avatarMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/);
    if (avatarMatch && (!avatar || avatar.startsWith('/assets/logo'))) {
      avatar = avatarMatch[1];
    }

    console.log(`[OK] ${name}: ${subText || 'no sub'} (${subNumber}) | Banner: ${banner ? 'YES' : 'NO'}`);

    return {
      ...streamer,
      ...(subNumber ? { subscribers: subNumber } : {}),
      ...(subText ? { subscribersText: subText } : {}),
      ...(banner ? { banner } : {}),
      ...(avatar ? { avatar } : {}),
    };
  } catch (err) {
    console.warn(`[Error] ${name}: ${err.message}`);
    return streamer;
  }
}

async function main() {
  const chunkSize = 6;
  const updatedRoster = [];

  for (let i = 0; i < roster.length; i += chunkSize) {
    const chunk = roster.slice(i, i + chunkSize);
    console.log(
      `\nProcessing chunk ${i + 1} - ${Math.min(i + chunkSize, roster.length)} of ${roster.length}...`
    );
    const results = await Promise.all(chunk.map(fetchChannelData));
    updatedRoster.push(...results);
    await new Promise((r) => setTimeout(r, 500));
  }

  // Sort roster prioritized by subscriber count descending
  updatedRoster.sort((a, b) => (b.subscribers || 0) - (a.subscribers || 0));

  fs.writeFileSync(ROSTER_PATH, JSON.stringify(updatedRoster, null, 2), 'utf8');
  console.log(`\n[Done] Successfully enriched and sorted ${updatedRoster.length} streamers in ${ROSTER_PATH}`);
}

main();
