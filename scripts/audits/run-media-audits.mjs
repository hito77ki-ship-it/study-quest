#!/usr/bin/env node

/**
 * Read-only media audits for Study Quest.
 *
 * Modes:
 *   internal-links  Local HTML/link graph and hub coverage
 *   production      Live HTTP/meta/OGP/JSON-LD/image smoke checks
 *   adsense         Originality and freshness candidates for human review
 *   all             Run all three audits
 *
 * No article or public page is edited by this script.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_OUTPUT = path.join(ROOT, 'company', 'reports', 'automation');
const BASE_URL = 'https://study-quest.net/';
const PRODUCTION_PAGES = [
  '', 'boki.html', 'boki1.html', 'boki2.html', 'boki3-progress.html',
  'fp3.html', 'shihoshoshi.html', 'app.html',
];

const HUBS = new Set([
  'boki.html', 'boki1.html', 'boki2.html', 'fp3.html', 'fp.html', 'cpa.html',
  'zeirishi.html', 'shihoshoshi.html', 'takken.html', 'itp.html', 'toeic.html',
  'shukatsu-shikaku.html', 'keizoku.html', 'shikaku-list.html',
]);

const PREFIX_HUBS = [
  ['boki2-', 'boki2.html'], ['boki3-', 'boki.html'], ['boki-zero-', 'boki.html'],
  ['boki1-', 'boki1.html'], ['cpa-', 'cpa.html'], ['fp3-', 'fp3.html'],
  ['shihoshoshi-', 'shihoshoshi.html'], ['takken-', 'takken.html'],
  ['sharoshi-', 'takken.html'], ['gyosei-', 'takken.html'],
  ['mansion-', 'takken.html'], ['itp-', 'itp.html'], ['fe-', 'itp.html'],
  ['ap-', 'itp.html'], ['mos-', 'itp.html'], ['toeic-', 'toeic.html'],
  ['eiken-', 'toeic.html'], ['toefl-', 'toeic.html'], ['ielts-', 'toeic.html'],
  ['daigakusei-', 'shukatsu-shikaku.html'], ['shikaku-', 'shukatsu-shikaku.html'],
  ['shakaijin-', 'shukatsu-shikaku.html'], ['hatarakinagara-', 'shukatsu-shikaku.html'],
  ['keizoku-', 'keizoku.html'], ['boki-careless-', 'keizoku.html'],
  ['boki-zasetsu-', 'keizoku.html'], ['ai-shiwake-', 'keizoku.html'],
  ['boki-vs-fp', 'fp.html'], ['zeirishi-', 'zeirishi.html'],
];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    mode: 'all',
    outputDir: process.env.AUDIT_OUTPUT_DIR || DEFAULT_OUTPUT,
    write: true,
  };
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--mode') opts.mode = args[++i];
    else if (args[i] === '--output-dir') opts.outputDir = path.resolve(args[++i]);
    else if (args[i] === '--no-write') opts.write = false;
  }
  if (!['internal-links', 'production', 'adsense', 'all'].includes(opts.mode)) {
    throw new Error(`Unknown mode: ${opts.mode}`);
  }
  return opts;
}

function today() {
  return process.env.AUDIT_DATE || new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).replaceAll('-', '');
}

function htmlEscape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function extractHrefValues(html) {
  return [...html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
}

function localPathFromHref(href, sourceFile = '') {
  if (!href || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  if (href.startsWith('#')) return null;
  if (href.includes('${') || href.includes('{{')) return null;
  try {
    const url = new URL(href, `${BASE_URL}${sourceFile}`);
    if (url.origin !== new URL(BASE_URL).origin) return null;
    let pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if (!pathname) pathname = 'index.html';
    return pathname;
  } catch {
    return null;
  }
}

async function rootHtmlFiles() {
  const names = await fs.readdir(ROOT);
  return names.filter((name) => name.endsWith('.html'));
}

async function walkFiles(dir, relative = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'build') continue;
    const absolute = path.join(dir, entry.name);
    const childRelative = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(absolute, childRelative));
    else files.push(childRelative.replaceAll(path.sep, '/'));
  }
  return files;
}

async function readHtmlMap(files) {
  const entries = await Promise.all(files.map(async (file) => [
    file, await fs.readFile(path.join(ROOT, file), 'utf8'),
  ]));
  return new Map(entries);
}

function isArticle(html) {
  return /"@type"\s*:\s*"Article"/.test(html) || /<meta[^>]+property=["']og:type["'][^>]+content=["']article/i.test(html);
}

function extractRegisteredArticles(source) {
  return new Set([...source.matchAll(/["']([^"']+\.html)["']\s*:/g)].map((match) => match[1]));
}

function hubFor(file) {
  if (HUBS.has(file)) return null;
  for (const [prefix, hub] of PREFIX_HUBS) if (file.startsWith(prefix)) return hub;
  if (file === 'boki.html') return null;
  if (file === 'fp.html') return null;
  return null;
}

function formatList(items, empty = 'なし') {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : empty;
}

async function runInternalLinks() {
  const files = await rootHtmlFiles();
  const html = await readHtmlMap(files);
  const articleFiles = files.filter((file) => isArticle(html.get(file)));
  const existing = new Set(await walkFiles(ROOT));
  const incoming = new Map(files.map((file) => [file, []]));
  const broken = [];
  const linksByFile = new Map();

  for (const [file, source] of html) {
    const targets = extractHrefValues(source)
      .map((href) => localPathFromHref(href, file))
      .filter(Boolean);
    linksByFile.set(file, new Set(targets));
    for (const target of targets) {
      if (!existing.has(target)) broken.push(`${file} -> ${target}`);
      else incoming.get(target)?.push(file);
    }
  }

  const widgets = await fs.readFile(path.join(ROOT, 'article-widgets.js'), 'utf8');
  const registered = extractRegisteredArticles(widgets);
  const missingHubLinks = [];
  const widgetOnlyHubLinks = [];
  for (const file of articleFiles) {
    const hub = hubFor(file);
    if (!hub || file === hub) continue;
    const links = linksByFile.get(file) || new Set();
    if (links.has(hub)) continue;
    if (registered.has(file)) widgetOnlyHubLinks.push(`${file} -> ${hub}（ウィジェット登録あり）`);
    else missingHubLinks.push(`${file} -> ${hub}`);
  }

  const hubChecks = [...HUBS].filter((hub) => existing.has(hub)).map((hub) => {
    const links = linksByFile.get(hub) || new Set();
    const related = [...links].filter((target) => articleFiles.includes(target) && target !== hub);
    return {
      hub,
      relatedCount: related.length,
      hasApp: links.has('app.html'),
      ok: related.length > 0 && links.has('app.html'),
    };
  });
  const orphanCandidates = articleFiles.filter((file) => {
    const hasIncoming = (incoming.get(file) || []).length > 0;
    return !hasIncoming && !registered.has(file);
  });

  const failedHubChecks = hubChecks.filter((check) => !check.ok);
  const report = `# 内部リンク・孤立記事監査（${today()}）

## 概要

- 対象HTML: ${files.length}本
- Article記事: ${articleFiles.length}本
- 監査方針: 自動修正なし。発見と改善候補の記録のみ

## 判定

- 内部リンク404候補: **${broken.length}件**
- 代表ハブへ静的リンクがない記事: **${missingHubLinks.length}件**
- ウィジェット登録でハブ導線を補っている記事: **${widgetOnlyHubLinks.length}件**
- ハブから関連記事・アプリの両方へ進めない候補: **${failedHubChecks.length}件**
- HTMLリンクとウィジェット登録のどちらにも出ない孤立候補: **${orphanCandidates.length}件**

## 404候補

${formatList(broken)}

## 代表ハブへの戻り導線

### 要対応候補

${formatList(missingHubLinks)}

### ウィジェット経由の確認候補

${formatList(widgetOnlyHubLinks)}

## ハブからの出口

${failedHubChecks.length ? failedHubChecks.map((check) => `- ${check.hub}: 関連記事${check.relatedCount}件 / app.htmlリンク=${check.hasApp ? 'あり' : 'なし'}`).join('\n') : '全対象ハブで関連記事とapp.htmlへの導線を確認'}

## 孤立候補

${formatList(orphanCandidates)}

## 次の判断

404候補は最優先で確認する。ハブ導線と孤立候補は、既存ウィジェットの動的生成を確認したうえで、必要なものだけ稟議候補にする。記事本文・リンクの自動編集は行っていない。
`;
  return { name: `${today()}-internal-link-audit.md`, content: report };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { 'user-agent': 'StudyQuest-MediaAudit/1.0', ...(options.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

function parseMeta(html, pattern) {
  const match = html.match(pattern);
  return match?.[1]?.trim() || null;
}

function parseJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const errors = [];
  for (const block of blocks) {
    try { JSON.parse(block[1]); } catch (error) { errors.push(error.message); }
  }
  return { count: blocks.length, errors };
}

function extractLocalImages(html) {
  return [...html.matchAll(/<img\b[^>]+\bsrc=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((src) => !/^(?:https?:|data:|#)/i.test(src))
    .filter((src) => !src.includes('${') && !src.includes('{{'));
}

async function checkUrl(url) {
  try {
    const response = await fetchWithTimeout(url);
    const body = await response.text();
    return { url, status: response.status, body, error: null };
  } catch (error) {
    return { url, status: 0, body: '', error: error.message };
  }
}

async function runProduction() {
  const pages = [];
  const imageChecks = [];
  for (const page of PRODUCTION_PAGES) {
    const url = new URL(page, BASE_URL).href;
    const result = await checkUrl(url);
    const title = parseMeta(result.body, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const canonical = parseMeta(result.body, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
    const ogImage = parseMeta(result.body, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i);
    const jsonLd = parseJsonLd(result.body);
    const images = [...new Set(extractLocalImages(result.body))].slice(0, 40);
    for (const image of images) imageChecks.push({ page, url: new URL(image, url).href });
    pages.push({ page: page || '/', status: result.status, error: result.error, title, canonical, ogImage, jsonLd, imageCount: images.length });
  }

  const imageResults = [];
  for (const item of imageChecks) {
    const result = await checkUrl(item.url);
    imageResults.push({ ...item, status: result.status, error: result.error });
  }
  const failures = pages.filter((page) => page.status !== 200 || page.error || !page.title || !page.canonical || !page.ogImage || page.jsonLd.errors.length);
  const imageFailures = imageResults.filter((image) => image.status < 200 || image.status >= 400 || image.error);
  const report = `# 本番サイト表示監視（${today()}）

## 監視対象

${PRODUCTION_PAGES.map((page) => `- ${page || '/'}`).join('\n')}

## 判定

- ページ確認: ${pages.length}件
- ページ要確認: **${failures.length}件**
- 画像確認: ${imageResults.length}件
- 画像404・取得失敗: **${imageFailures.length}件**
- 自動修正: なし

## ページ結果

| URL | HTTP | title | canonical | og:image | JSON-LD |
|---|---:|---|---|---|---|
${pages.map((page) => `| ${page.page} | ${page.status || '失敗'} | ${page.title ? 'あり' : 'なし'} | ${page.canonical ? 'あり' : 'なし'} | ${page.ogImage ? 'あり' : 'なし'} | ${page.jsonLd.count}件 / エラー${page.jsonLd.errors.length} |`).join('\n')}

## 要確認ページ

${formatList(failures.map((page) => `${page.page}: HTTP=${page.status || '失敗'}${page.error ? ` / ${page.error}` : ''}`))}

## 要確認画像

${formatList(imageFailures.map((image) => `${image.page}: ${image.url}（HTTP=${image.status || '失敗'}${image.error ? ` / ${image.error}` : ''}）`))}

## 次の判断

HTTPエラー、canonical欠落、JSON-LD構文エラー、画像取得失敗は本番事故として優先確認する。タイトルやOGPの内容変更は自動で行わず、差分と確認結果を報告する。
`;
  return { name: `${today()}-production-monitor.md`, content: report };
}

function extractDate(html, pattern) {
  return html.match(pattern)?.[1] || null;
}

async function latestKeywordFocus() {
  const reportDir = path.join(ROOT, 'company', 'reports');
  const names = (await fs.readdir(reportDir))
    .filter((name) => name.includes('キーワード順位トラッキング') && name.endsWith('.md'))
    .sort();
  if (!names.length) return new Set();
  const text = await fs.readFile(path.join(reportDir, names.at(-1)), 'utf8');
  return new Set([...text.matchAll(/\b[a-z0-9][a-z0-9-]+\.html\b/gi)].map((match) => match[0]));
}

async function runAdsense() {
  const files = await rootHtmlFiles();
  const html = await readHtmlMap(files);
  const articles = files.filter((file) => isArticle(html.get(file)));
  const focus = await latestKeywordFocus();
  const uniqueMissing = [];
  const freshnessIssues = [];
  const referencesMissing = [];
  const focusMissing = [];
  const todayDate = new Date(`${today().slice(0, 4)}-${today().slice(4, 6)}-${today().slice(6, 8)}T00:00:00+09:00`);

  for (const file of articles) {
    const source = html.get(file);
    const hasStructuredEditorialNote = /\bclass\s*=\s*["'][^"']*\bsq-originality-note\b/i.test(source);
    const hasUnique = hasStructuredEditorialNote || /この記事の判断|独自の判断|判断基準|学習手順|勉強手順/.test(source);
    const modified = extractDate(source, /"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
    const visibleMatch = source.match(/(?:更新日|更新|最終更新)[：:]\s*(\d{4})年(\d{1,2})月(\d{1,2})日/);
    const visible = visibleMatch
      ? `${visibleMatch[1]}-${visibleMatch[2].padStart(2, '0')}-${visibleMatch[3].padStart(2, '0')}`
      : null;
    const hasReferences = /参考資料|参考文献|出典|公式サイト|一次情報/.test(source);
    const variableTopic = /試験|受験料|合格率|価格|日程|税制|CBT|教材|配信状況/.test(source);
    if (!hasUnique) uniqueMissing.push(file);
    if (focus.has(file) && !hasUnique) focusMissing.push(file);
    if (!modified || !visible) freshnessIssues.push(`${file}: 更新日またはdateModifiedが不足`);
    else if (modified !== visible) freshnessIssues.push(`${file}: 表示更新日とdateModifiedが不一致`);
    else if (variableTopic && (todayDate - new Date(`${modified}T00:00:00+09:00`)) / 86400000 > 90) freshnessIssues.push(`${file}: 90日超の変動情報を含むため一次情報の再確認候補（${modified}）`);
    if (!hasReferences) referencesMissing.push(file);
  }

  const report = `# AdSense独自性・事実鮮度監査（${today()}）

## 概要

- Article記事: ${articles.length}本
- GSC記録から抽出した重点候補: ${focus.size ? `${focus.size}本` : 'なし（GSC記録がないため全記事を確認）'}
- 方針: 自動修正なし。稟議・手動確認の候補を作成

## 判定

- 独自判断・学習手順の候補不足: **${uniqueMissing.length}本**
- 重点候補のうち独自要素不足: **${focusMissing.length}本**
- 更新日・制度情報の鮮度確認候補: **${freshnessIssues.length}件**
- 参考資料・出典の明示確認候補: **${referencesMissing.length}本**

## 重点候補の独自性不足

${formatList(focusMissing)}

## 独自判断・学習手順の候補不足（全記事）

${formatList(uniqueMissing)}

## 事実鮮度・更新日の確認候補

${formatList(freshnessIssues)}

## 参考資料・出典の確認候補

${formatList(referencesMissing)}

## 次の判断

この監査は「不足している可能性」を検出する。記事の自動修正、出典の自動補完、事実の自動断定は行わない。重点候補から一次情報を確認し、構成変更や独自判断の追加が必要なものだけ稟議書を作成する。
`;
  return { name: `${today()}-adsense-originality-freshness.md`, content: report };
}

async function main() {
  const opts = parseArgs();
  const reports = [];
  if (opts.mode === 'internal-links' || opts.mode === 'all') reports.push(await runInternalLinks());
  if (opts.mode === 'production' || opts.mode === 'all') reports.push(await runProduction());
  if (opts.mode === 'adsense' || opts.mode === 'all') reports.push(await runAdsense());
  for (const report of reports) {
    const outputPath = path.join(opts.outputDir, report.name);
    if (opts.write) {
      await fs.mkdir(opts.outputDir, { recursive: true });
      await fs.writeFile(outputPath, report.content, 'utf8');
    }
    console.log(`${opts.write ? 'Wrote' : 'Generated'}: ${outputPath}`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
