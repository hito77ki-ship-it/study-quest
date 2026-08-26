#!/usr/bin/env node
// Usage:
//   node scripts/gsc-keyword-watch.js --key <service-account.json> \
//     --save-snapshot tmp/gsc-keyword-watch.json
//   node scripts/gsc-keyword-watch.js --key <service-account.json> \
//     --previous tmp/gsc-keyword-watch.json --save-snapshot tmp/gsc-keyword-watch.json
//
// Retrieves every Search Console query the API makes available (up to 25,000),
// compares it with the previous weekly snapshot, and fetches 90 days of daily
// data only for queries that disappeared from the previous top 30 or lost at
// least half of their impressions. It never edits site content.

const fs = require('fs');
const path = require('path');
const { getAccessToken, queryAllRows, queryRange, fmtDate } = require('./lib/gsc-auth');

const DEFAULT_SITE = 'https://study-quest.net/';
const DEFAULT_DAYS = 28;
const DEFAULT_LAG_DAYS = 3;
const DAILY_DAYS = 90;

function parseArgs(args = process.argv.slice(2)) {
  const opts = {
    key: process.env.GSC_KEY_FILE,
    site: DEFAULT_SITE,
    days: DEFAULT_DAYS,
    lagDays: DEFAULT_LAG_DAYS,
    previous: null,
    saveSnapshot: null,
    minImpressions: 3,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--key') opts.key = args[++i];
    else if (args[i] === '--site') opts.site = args[++i];
    else if (args[i] === '--days') opts.days = Number(args[++i]);
    else if (args[i] === '--lag-days') opts.lagDays = Number(args[++i]);
    else if (args[i] === '--previous') opts.previous = args[++i];
    else if (args[i] === '--save-snapshot') opts.saveSnapshot = args[++i];
    else if (args[i] === '--min-impressions') opts.minImpressions = Number(args[++i]);
    else if (args[i] === '--help' || args[i] === '-h') opts.help = true;
    else throw new Error(`Unknown option: ${args[i]}`);
  }
  for (const name of ['days', 'lagDays', 'minImpressions']) {
    if (!Number.isFinite(opts[name]) || opts[name] < 0) throw new Error(`--${name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} must be a non-negative number`);
  }
  return opts;
}

function usage() {
  return [
    'Usage: node scripts/gsc-keyword-watch.js --key <service-account.json> [options]',
    '',
    'Options:',
    '  --previous <file>       Previous weekly snapshot JSON',
    '  --save-snapshot <file>  Where to save this run for next week',
    '  --site <url>            Search Console property (default: https://study-quest.net/)',
    '  --days <n>              Rolling query period (default: 28)',
    '  --lag-days <n>          GSC data delay allowance (default: 3)',
    '  --min-impressions <n>   Report count threshold (default: 3)',
  ].join('\n');
}

function dateRange(days, lagDays, now = new Date()) {
  const end = new Date(now);
  end.setDate(end.getDate() - lagDays);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return { start, end };
}

function sortRows(rows) {
  return [...rows].sort((a, b) =>
    b.clicks - a.clicks || b.impressions - a.impressions || a.position - b.position || a.keys[0].localeCompare(b.keys[0], 'ja')
  );
}

function snapshotFromRows(site, range, rows) {
  return {
    version: 1,
    site,
    period: { start: fmtDate(range.start), end: fmtDate(range.end) },
    generatedAt: new Date().toISOString(),
    queries: sortRows(rows).map((row, index) => ({
      query: row.keys[0],
      rank: index + 1,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    })),
  };
}

function readSnapshot(file) {
  const snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.queries)) {
    throw new Error(`${file} is not a gsc-keyword-watch snapshot`);
  }
  return snapshot;
}

function writeSnapshot(file, snapshot) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`);
}

function findWatchQueries(previous, current) {
  const currentByQuery = new Map(current.queries.map((row) => [row.query, row]));
  return previous.queries
    .map((before) => {
      const now = currentByQuery.get(before.query);
      const leftTop30 = before.rank <= 30 && !now;
      const halfOrMoreDrop = before.impressions > 0 && (!now || now.impressions <= before.impressions / 2);
      if (!leftTop30 && !halfOrMoreDrop) return null;
      return {
        query: before.query,
        reason: [leftTop30 && '前回トップ30から消失', halfOrMoreDrop && '表示回数が50%以上減少'].filter(Boolean).join('・'),
        before,
        now: now || { clicks: 0, impressions: 0, position: null },
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.before.impressions - a.before.impressions || a.before.rank - b.before.rank);
}

function exactQueryFilter(query) {
  return [{ filters: [{ dimension: 'query', operator: 'equals', expression: query }] }];
}

async function fetchDailyRows(token, site, query, now = new Date()) {
  const range = dateRange(DAILY_DAYS, DEFAULT_LAG_DAYS, now);
  const result = await queryRange(token, site, fmtDate(range.start), fmtDate(range.end), ['date'], {
    rowLimit: DAILY_DAYS,
    dimensionFilterGroups: exactQueryFilter(query),
  });
  return { range, rows: result.rows || [] };
}

function summarizeDaily(rows) {
  const byDate = new Map(rows.map((row) => [row.keys[0], row]));
  const last14 = [...byDate.values()].filter((row) => row.keys[0] >= fmtDate(new Date(Date.now() - 13 * 86400000)));
  const last14Impressions = last14.reduce((sum, row) => sum + row.impressions, 0);
  const lastSeen = rows.length ? rows[rows.length - 1].keys[0] : 'なし';
  return { last14Impressions, lastSeen };
}

async function run(opts, dependencies = {}) {
  const token = dependencies.token || (await getAccessToken(opts.key));
  const now = dependencies.now || new Date();
  const range = dateRange(opts.days, opts.lagDays, now);
  const rows = await queryAllRows(token, opts.site, fmtDate(range.start), fmtDate(range.end), ['query']);
  const snapshot = snapshotFromRows(opts.site, range, rows);
  const previous = opts.previous ? readSnapshot(opts.previous) : null;
  if (previous && previous.site !== opts.site) throw new Error('Previous snapshot site does not match --site');
  const watch = previous ? findWatchQueries(previous, snapshot) : [];
  return { range, snapshot, previous, watch, token };
}

async function main() {
  const opts = parseArgs();
  if (opts.help) return console.log(usage());
  if (!opts.key) throw new Error('Missing --key.\n\n' + usage());
  const result = await run(opts);
  const { snapshot } = result;
  const visibleCount = snapshot.queries.filter((row) => row.impressions >= opts.minImpressions).length;

  console.log('\n=== Study Quest キーワード監視 ===');
  console.log(`期間: ${snapshot.period.start} 〜 ${snapshot.period.end}（直近${opts.days}日）`);
  console.log(`APIで取得できたクエリ: ${snapshot.queries.length}件`);
  console.log(`表示${opts.minImpressions}回以上のクエリ: ${visibleCount}件`);

  if (!result.previous) {
    console.log('\n前回スナップショットがないため、今回は比較せずベースラインを保存します。');
  } else if (!result.watch.length) {
    console.log('\n要日別確認: 0件');
  } else {
    console.log(`\n要日別確認: ${result.watch.length}件`);
    for (const item of result.watch) {
      const daily = await fetchDailyRows(result.token, opts.site, item.query);
      const dailySummary = summarizeDaily(daily.rows);
      console.log(`\n- ${item.query}（${item.reason}）`);
      console.log(`  前回: 表示${item.before.impressions} / 順位${item.before.position.toFixed(1)} / ${item.before.rank}位`);
      console.log(`  今回: 表示${item.now.impressions} / 順位${item.now.position == null ? '圏外・未取得' : item.now.position.toFixed(1)}`);
      console.log(`  日別90日: 直近14日表示${dailySummary.last14Impressions} / 最終表示日 ${dailySummary.lastSeen}`);
      if (dailySummary.last14Impressions === 0) console.log('  判定補助: 今週の急落と断定せず、移動窓に残った過去データの可能性を記録する。');
    }
  }

  if (opts.saveSnapshot) {
    writeSnapshot(opts.saveSnapshot, snapshot);
    console.log(`\nスナップショット保存先: ${opts.saveSnapshot}`);
  }
  console.log('');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  dateRange,
  findWatchQueries,
  parseArgs,
  snapshotFromRows,
  summarizeDaily,
};
