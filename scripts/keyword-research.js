#!/usr/bin/env node
// Usage: node scripts/keyword-research.js <seed keyword> [--key <service-account.json>] [--site <url>]
//
// Combines two free, no-API-key data sources into one keyword report:
//   1. Google Autocomplete suggestions for the seed keyword (public JSON endpoint)
//   2. Study Quest's own Search Console queries that contain the seed keyword,
//      surfaced as "content gaps" — queries with real impressions but a weak
//      position (page 2+), meaning people are searching and finding the site
//      but not clicking. These are stronger candidates than generic keyword-tool
//      suggestions because they're demand the site is already close to capturing.

const { getAccessToken, queryRange, fmtDate } = require('./lib/gsc-auth');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { key: process.env.GSC_KEY_FILE, site: 'https://study-quest.net/', seed: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--key') opts.key = args[++i];
    else if (args[i] === '--site') opts.site = args[++i];
    else if (!opts.seed) opts.seed = args[i];
  }
  return opts;
}

async function fetchAutocomplete(seed) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=ja&ie=UTF-8&oe=UTF-8&q=${encodeURIComponent(seed)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Autocomplete fetch failed (${res.status})`);
  const data = await res.json();
  return data[1] || [];
}

async function fetchGscGaps(key, site, seed) {
  const token = await getAccessToken(key);
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - 84); // 12 weeks, to catch low-volume queries

  const data = await queryRange(token, site, fmtDate(start), fmtDate(end), ['query', 'page'], {
    rowLimit: 200,
    dimensionFilterGroups: [{ filters: [{ dimension: 'query', operator: 'contains', expression: seed }] }],
  });
  return data.rows || [];
}

async function main() {
  const opts = parseArgs();
  if (!opts.seed) {
    console.error('Usage: node scripts/keyword-research.js <seed keyword> [--key <service-account.json>] [--site <url>]');
    process.exit(1);
  }

  console.log(`\n=== キーワード調査: 「${opts.seed}」 ===\n`);

  const [suggestions, gscRows] = await Promise.all([
    fetchAutocomplete(opts.seed).catch((e) => {
      console.error(`autocomplete取得失敗: ${e.message}`);
      return [];
    }),
    opts.key
      ? fetchGscGaps(opts.key, opts.site, opts.seed).catch((e) => {
          console.error(`GSC取得失敗: ${e.message}`);
          return [];
        })
      : Promise.resolve([]),
  ]);

  console.log(`--- Googleサジェスト（関連検索） ${suggestions.length}件 ---`);
  suggestions.forEach((s, i) => console.log(`${i + 1}. ${s}`));

  if (!opts.key) {
    console.log('\n(GSCデータを見るには --key <service-account.json> を指定してください)');
    console.log('');
    return;
  }

  const weak = gscRows
    .filter((r) => r.position > 10 && r.impressions >= 2)
    .sort((a, b) => b.impressions - a.impressions);
  const strong = gscRows.filter((r) => r.position <= 10);

  console.log(`\n--- 自社GSCで「${opts.seed}」を含み、表示はあるが順位が弱いクエリ（コンテンツギャップ候補） ${weak.length}件 ---`);
  weak.slice(0, 20).forEach((r, i) => {
    console.log(`${i + 1}. ${r.keys[0]} — 表示${r.impressions} / クリック${r.clicks} / 順位${r.position.toFixed(1)} / ページ:${r.keys[1]}`);
  });

  console.log(`\n--- 既に上位（10位以内）で拾えているクエリ ${strong.length}件（参考） ---`);
  strong.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. ${r.keys[0]} — 表示${r.impressions} / クリック${r.clicks} / 順位${r.position.toFixed(1)}`);
  });
  console.log('');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
