#!/usr/bin/env node

/**
 * Study Quest content quality gate.
 *
 * This script is deliberately read-only for public content. It catches
 * deterministic structural breakage, and emits evidence-backed review
 * candidates for facts and theme contrast that require human judgement.
 *
 * Usage:
 *   node scripts/audits/run-content-quality-gate.mjs
 *   node scripts/audits/run-content-quality-gate.mjs --paths fe.html,itp-vs-fe.html
 *   node scripts/audits/run-content-quality-gate.mjs --strict --no-write
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_OUTPUT = path.join(ROOT, 'company', 'reports', 'automation');
const WIDGETS_FILE = 'article-widgets.js';
const TODAY = process.env.AUDIT_DATE || new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date()).replaceAll('-', '');

/*
 * These checks do not encode a supposedly permanent “correct value.” They only
 * compare pages that make the same reader-facing claim. The report always
 * shows the exact extracted wording, so an editor can verify it against the
 * current primary source before changing an article.
 */
const SENSITIVE_METRICS = [
  {
    id: 'fe-pass-rate',
    label: '基本情報技術者試験の合格率',
    files: ['fe.html', 'fe-vs-ap.html'],
    /* IT passport-vs-FE tables are checked separately in the article review.
       After tags are stripped, a static parser cannot safely attribute a table
       value to one of its two columns. */
    patterns: [
      /基本情報(?:技術者)?(?:試験)?(?:（FE）)?[^。]{0,180}?合格率\s*(?:は|が|：|:)?\s*(?:約)?(\d{1,3}(?:\.\d+)?\s*(?:[〜～]\s*\d{1,3}(?:\.\d+)?)?\s*%)/g,
    ],
  },
  {
    id: 'itp-study-hours',
    label: 'ITパスポートの勉強時間',
    files: ['itp.html', 'itp-vs-fe.html'],
    patterns: [
      /ITパスポート(?:試験)?(?:の)?(?:独学に必要な)?(?:勉強時間)?(?:は|が|：|:)\s*(?:IT初心者(?:で|は)?\s*)?(\d{1,4}\s*(?:[〜～]\s*\d{1,4})?\s*時間)/g,
      /ITパスポート(?:試験)?[^。]{0,70}?勉強時間[^。]{0,30}?(\d{1,4}\s*(?:[〜～]\s*\d{1,4})?\s*時間)/g,
    ],
  },
];

function parseArgs() {
  const opts = { outputDir: DEFAULT_OUTPUT, paths: null, write: true, strict: false };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--paths') opts.paths = args[++i]?.split(',').map((item) => item.trim()).filter(Boolean);
    else if (args[i] === '--output-dir') opts.outputDir = path.resolve(args[++i]);
    else if (args[i] === '--no-write') opts.write = false;
    else if (args[i] === '--strict') opts.strict = true;
    else throw new Error(`Unknown option: ${args[i]}`);
  }
  return opts;
}

function isArticle(html) {
  return /"@type"\s*:\s*"Article"/.test(html) || /<meta[^>]+property=["']og:type["'][^>]+content=["']article/i.test(html);
}

function textOnly(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function lineOf(source, index) {
  return source.slice(0, Math.max(0, index)).split('\n').length;
}

function shorten(value, max = 150) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1)}…`;
}

function formatList(items, fallback = 'なし') {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : fallback;
}

function normalizeValue(value) {
  return value.replace(/\s/g, '').replaceAll('～', '〜');
}

function parseJsonLd(source, file) {
  const blocks = [...source.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const errors = [];
  const values = [];
  for (const block of blocks) {
    try { values.push(JSON.parse(block[1])); }
    catch (error) { errors.push(`${file}:${lineOf(source, block.index)} ${error.message}`); }
  }
  return { count: blocks.length, errors, values };
}

function articleDateFromJsonLd(values) {
  const stack = [...values];
  while (stack.length) {
    const current = stack.pop();
    if (Array.isArray(current)) { stack.push(...current); continue; }
    if (!current || typeof current !== 'object') continue;
    if (current['@type'] === 'Article' && typeof current.dateModified === 'string') return current.dateModified;
    stack.push(...Object.values(current));
  }
  return null;
}

function visibleUpdatedDate(source) {
  const match = source.match(/更新日\s*[：:]?\s*(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (!match) return null;
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
}

function parseSitemap(source) {
  const dates = new Map();
  const blocks = [...source.matchAll(/<url>([\s\S]*?)<\/url>/gi)];
  for (const block of blocks) {
    const loc = block[1].match(/<loc>\s*https:\/\/study-quest\.net\/([^<\s]+)\s*<\/loc>/i)?.[1];
    const lastmod = block[1].match(/<lastmod>\s*(\d{4}-\d{2}-\d{2})\s*<\/lastmod>/i)?.[1];
    if (loc && lastmod) dates.set(decodeURIComponent(loc), lastmod);
  }
  return dates;
}

function extractCssBlocks(source) {
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => ({ css: match[1], index: match.index }));
}

function selectorRoot(selector) {
  const match = selector.match(/[.#]([a-z][\w-]*)/i);
  if (!match) return null;
  return match[1].replace(/__(.+)$/, '').replace(/--(.+)$/, '');
}

function darkCssRiskCandidates(source, sharedCss) {
  const backgrounds = [];
  const colors = [];
  for (const block of extractCssBlocks(source)) {
    for (const rule of block.css.matchAll(/([^{}@][^{}]*)\{([^{}]*)\}/g)) {
      const selector = rule[1].trim();
      const declarations = rule[2];
      const root = selectorRoot(selector);
      if (!root) continue;
      const line = lineOf(source, block.index + rule.index);
      if (/(?:background|background-color)\s*:\s*#(?:fff(?:fff)?)(?:\s|;|!|$)/i.test(declarations)) {
        backgrounds.push({ root, selector, line });
      }
      if(/(?:^|;)\s*color\s*:\s*var\(/i.test(declarations)) {
        colors.push({ root, selector, line });
      }
    }
  }
  const sharedAndLocal = `${sharedCss}\n${source}`;
  const candidates = [];
  for (const background of backgrounds) {
    const variableColor = colors.find((color) => color.root === background.root);
    if (!variableColor) continue;
    const escapedRoot = background.root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hasDarkOverride = new RegExp(`html\\[data-theme=["']dark["']\\][\\s\\S]{0,800}[.#]${escapedRoot}`, 'i').test(sharedAndLocal)
      || new RegExp(`[.#]${escapedRoot}[\\s\\S]{0,800}html\\[data-theme=["']dark["']`, 'i').test(sharedAndLocal);
    if (!hasDarkOverride) candidates.push({ background, variableColor });
  }
  return candidates;
}

function extractMetricValues(source, metric) {
  const body = source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || source;
  const text = textOnly(body);
  const values = [];
  for (const pattern of metric.patterns) {
    for (const match of text.matchAll(pattern)) {
      const value = match[1];
      if (!value || metric.reject?.(match[0])) continue;
      const start = Math.max(0, match.index - 80);
      const end = Math.min(text.length, match.index + match[0].length + 80);
      values.push({ value: normalizeValue(value), context: shorten(text.slice(start, end)) });
    }
  }
  const deduped = new Map();
  for (const value of values) deduped.set(`${value.value}\u0000${value.context}`, value);
  return [...deduped.values()];
}

function h1Count(source) {
  return [...source.matchAll(/<h1\b/gi)].length;
}

function extractLocalHrefs(source) {
  return [...source.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .map((href) => {
      if (/^(?:mailto:|tel:|javascript:|data:|#)/i.test(href)) return null;
      try {
        const url = new URL(href, 'https://study-quest.net/');
        if (url.origin !== 'https://study-quest.net') return null;
        const local = decodeURIComponent(url.pathname).replace(/^\/+/, '');
        return local.endsWith('.html') ? local : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function rootHtmlFiles() {
  return (await fs.readdir(ROOT)).filter((name) => name.endsWith('.html')).sort();
}

async function main() {
  const opts = parseArgs();
  const allHtml = await rootHtmlFiles();
  const requested = opts.paths || allHtml;
  const missingRequested = requested.filter((file) => !allHtml.includes(file));
  if (missingRequested.length) throw new Error(`Unknown root HTML file(s): ${missingRequested.join(', ')}`);

  const html = new Map(await Promise.all(requested.map(async (file) => [file, await fs.readFile(path.join(ROOT, file), 'utf8')])));
  const sharedCss = await fs.readFile(path.join(ROOT, WIDGETS_FILE), 'utf8');
  const sitemap = parseSitemap(await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8'));
  const allFiles = new Set(await fs.readdir(ROOT));
  const articleFiles = requested.filter((file) => isArticle(html.get(file)));

  const structural = [];
  const dateIssues = [];
  const themeRisks = [];
  const brokenLinks = [];
  const metricRows = [];

  for (const file of articleFiles) {
    const source = html.get(file);
    const h1s = h1Count(source);
    if (h1s !== 1) structural.push(`${file}: h1 が ${h1s}件`);
    const jsonLd = parseJsonLd(source, file);
    if (!jsonLd.count) structural.push(`${file}: JSON-LD がない`);
    structural.push(...jsonLd.errors);

    const structuredDate = articleDateFromJsonLd(jsonLd.values);
    const visibleDate = visibleUpdatedDate(source);
    const sitemapDate = sitemap.get(file) || null;
    if (!structuredDate || !visibleDate || !sitemapDate) {
      dateIssues.push(`${file}: dateModified=${structuredDate || 'なし'} / 表示更新日=${visibleDate || 'なし'} / sitemap=${sitemapDate || 'なし'}`);
    } else if (new Set([structuredDate, visibleDate, sitemapDate]).size !== 1) {
      dateIssues.push(`${file}: dateModified=${structuredDate} / 表示更新日=${visibleDate} / sitemap=${sitemapDate}`);
    }

    for (const href of extractLocalHrefs(source)) {
      if (!allFiles.has(href)) brokenLinks.push(`${file} -> ${href}`);
    }
    /* The shared theme toggle is injected only into pages loading the widgets.
       A standalone light-only page is not a dark-mode contrast failure. */
    if (/<script\s+src=["']article-widgets\.js["']\s*><\/script>/i.test(source)) {
      for (const risk of darkCssRiskCandidates(source, sharedCss)) {
        themeRisks.push(`${file}:${risk.background.line} ${risk.background.selector}（白背景） × ${risk.variableColor.selector}:${risk.variableColor.line}（テーマ追従文字色、dark上書き未検出）`);
      }
    }
  }

  for (const metric of SENSITIVE_METRICS) {
    const entries = [];
    for (const file of metric.files) {
      if (!html.has(file)) continue;
      for (const extracted of extractMetricValues(html.get(file), metric)) entries.push({ file, ...extracted });
    }
    const values = [...new Set(entries.map((entry) => entry.value))];
    if (values.length > 1) metricRows.push({ metric, values, entries });
  }

  const blockers = [...structural, ...brokenLinks];
  const report = `# コンテンツ品質ゲート（${TODAY}）

## この監査の役割

公開ページを自動変更せず、再現できる機械検査だけを行う。構造エラーとローカルリンク切れは公開停止候補、制度数値と配色は一次情報または実画面で確認すべき候補として分離する。

## 対象・判定

- 対象HTML: ${requested.length}本（Article: ${articleFiles.length}本）
- 構造エラー（h1 / JSON-LD）: **${structural.length}件**
- ローカルリンク切れ: **${brokenLinks.length}件**
- 更新日3面不一致・欠落: **${dateIssues.length}件**
- ダークモード配色の静的リスク: **${themeRisks.length}件**
- 記事間の制度数値・学習時間の矛盾候補: **${metricRows.length}項目**

## 公開停止候補（機械的に確定できるもの）

${formatList(blockers)}

## 更新日3面

${formatList(dateIssues)}

## ダークモードの確認候補

静的検出は「白背景とテーマ変数の文字色が同じカード系統にあり、dark上書きを見つけられない」場合だけを出す。実際の適用順・コントラストは実画面で確認する。

${formatList(themeRisks)}

## 制度数値・学習時間の矛盾候補

${metricRows.length ? metricRows.map(({ metric, values, entries }) => `### ${metric.label}\n\n- 検出した表現: ${values.map((value) => `\`${value}\``).join(' / ')}\n${entries.map((entry) => `- ${entry.file}: \`${entry.value}\` — ${entry.context}`).join('\n')}`).join('\n\n') : 'なし'}

## 次の判断

1. 「公開停止候補」は修正後に同じコマンドで0件を確認する。
2. 制度数値は、この出力を正解と扱わない。必ず公式一次情報と照合し、事実誤りなら即時是正、構成追加なら稟議に分ける。
3. ダークモード候補はライト・ダーク両方の実画面で前景色と背景色を確認してから直す。静的候補0件は可読性の保証ではない。
`;

  const outputPath = path.join(opts.outputDir, `${TODAY}-content-quality-gate.md`);
  if (opts.write) {
    await fs.mkdir(opts.outputDir, { recursive: true });
    await fs.writeFile(outputPath, report, 'utf8');
  }
  console.log(`${opts.write ? 'Wrote' : 'Generated'}: ${outputPath}`);
  console.log(`Structural=${structural.length}, links=${brokenLinks.length}, dates=${dateIssues.length}, themeCandidates=${themeRisks.length}, metricCandidates=${metricRows.length}`);
  if (opts.strict && blockers.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
