#!/usr/bin/env node
// Usage: node scripts/gsc-report.js --key <service-account.json> [--site <url>] [--days N]
// Or set GSC_KEY_FILE env var instead of --key.
//
// Authenticates to the Search Console API as a service account (JWT signed
// with the key's private_key, no OAuth browser flow, no npm dependencies —
// uses Node's built-in crypto + fetch) and prints a search performance report:
// current vs previous period totals, top queries, top pages.

const { getAccessToken, queryRange, fmtDate } = require('./lib/gsc-auth');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { key: process.env.GSC_KEY_FILE, site: 'https://study-quest.net/', days: 28 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--key') opts.key = args[++i];
    else if (args[i] === '--site') opts.site = args[++i];
    else if (args[i] === '--days') opts.days = Number(args[++i]);
  }
  return opts;
}

function pct(now, prev) {
  if (!prev) return now ? '+∞%' : '±0%';
  const delta = ((now - prev) / prev) * 100;
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

async function main() {
  const opts = parseArgs();
  if (!opts.key) {
    console.error('Usage: node scripts/gsc-report.js --key <service-account.json> [--site <url>] [--days N]');
    console.error('Or set GSC_KEY_FILE env var.');
    process.exit(1);
  }

  const token = await getAccessToken(opts.key);

  const end = new Date();
  end.setDate(end.getDate() - 3); // GSC data lags ~2-3 days
  const curStart = new Date(end);
  curStart.setDate(curStart.getDate() - opts.days + 1);
  const prevEnd = new Date(curStart);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - opts.days + 1);

  const [curTotal, prevTotal, topQueries, topPages] = await Promise.all([
    queryRange(token, opts.site, fmtDate(curStart), fmtDate(end), []),
    queryRange(token, opts.site, fmtDate(prevStart), fmtDate(prevEnd), []),
    queryRange(token, opts.site, fmtDate(curStart), fmtDate(end), ['query'], { rowLimit: 15 }),
    queryRange(token, opts.site, fmtDate(curStart), fmtDate(end), ['page'], { rowLimit: 15 }),
  ]);

  const cur = (curTotal.rows || [])[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const prev = (prevTotal.rows || [])[0] || { clicks: 0, impressions: 0 };

  console.log(`\n=== Study Quest 検索パフォーマンスレポート ===`);
  console.log(`期間: ${fmtDate(curStart)} 〜 ${fmtDate(end)}（直近${opts.days}日、前の${opts.days}日と比較）\n`);
  console.log(`クリック数: ${cur.clicks}（前期間比 ${pct(cur.clicks, prev.clicks)}）`);
  console.log(`表示回数: ${cur.impressions}（前期間比 ${pct(cur.impressions, prev.impressions)}）`);
  console.log(`平均CTR: ${((cur.ctr || 0) * 100).toFixed(2)}%`);
  console.log(`平均掲載順位: ${(cur.position || 0).toFixed(1)}`);

  console.log(`\n--- クエリ別トップ${(topQueries.rows || []).length} ---`);
  (topQueries.rows || []).forEach((r, i) => {
    console.log(`${i + 1}. ${r.keys[0]} — クリック${r.clicks} / 表示${r.impressions} / 順位${r.position.toFixed(1)}`);
  });

  console.log(`\n--- ページ別トップ${(topPages.rows || []).length} ---`);
  (topPages.rows || []).forEach((r, i) => {
    console.log(`${i + 1}. ${r.keys[0]} — クリック${r.clicks} / 表示${r.impressions} / 順位${r.position.toFixed(1)}`);
  });
  console.log('');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
