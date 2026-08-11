#!/usr/bin/env node

/**
 * Study Quest AdSense policy safeguard.
 *
 * This is intentionally read-only for public pages. It turns the current
 * AdSense remediation decisions into repeatable checks so that a later edit
 * cannot silently restore ads to excluded pages or break the trust pages that
 * explain who operates the site and how to contact them.
 *
 * Usage:
 *   node scripts/audits/run-adsense-policy-gate.mjs
 *   node scripts/audits/run-adsense-policy-gate.mjs --strict --no-write
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_OUTPUT = path.join(ROOT, 'company', 'reports', 'automation');
const SITE_ORIGIN = 'https://study-quest.net/';

/* These pages are deliberately non-monetized. The 26 article pages come from
 * the approved low-scope inventory; 6 infrastructure pages should never carry
 * Google ad code because they are not reader-content surfaces. */
const NON_MONETIZED_PAGES = [
  'about.html', 'contact.html', 'privacy.html', 'terms.html', 'app.html', 'game.html',
  'fp3-iminai.html', 'boki2-keihi.html', 'boki2-kessan.html', 'boki3-keika2.html',
  'boki2-zairyouhi.html', 'shihoshoshi-futoki.html', 'fp3-lifeplanning.html',
  'shihoshoshi-kaishaho.html', 'fp3-risk.html', 'shihoshoshi-minpo-sosoku.html',
  'fp3-nannichi.html', 'shihoshoshi-minpo-bukken.html', 'fp3-finance.html',
  'boki2-noren-vs-fu-no-noren.html', 'shihoshoshi-start.html', 'boki2-shohin-baibai.html',
  'boki2-hyojun-genka.html', 'boki2-chokusetsu-genka.html',
  'boki1-shasai-teigaku-vs-risokuho.html', 'boki2-kobetsu-genka.html',
  'boki-zero-01.html', 'boki-zero-03.html', 'boki2-zeikouka.html',
  'boki2-arai-kirihanashi.html', 'boki2-yukashoken.html', 'boki3-koguchi.html',
];

const TRUST_PAGES = {
  'about.html': '運営者情報',
  'contact.html': 'お問い合わせ',
  'privacy.html': 'プライバシーポリシー',
  'terms.html': '利用規約',
};

function today() {
  return process.env.AUDIT_DATE || new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).replaceAll('-', '');
}

function parseArgs() {
  const options = { outputDir: DEFAULT_OUTPUT, write: true, strict: false };
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--output-dir') options.outputDir = path.resolve(args[++index]);
    else if (args[index] === '--no-write') options.write = false;
    else if (args[index] === '--strict') options.strict = true;
    else throw new Error(`Unknown option: ${args[index]}`);
  }
  return options;
}

function isArticle(source) {
  return /"@type"\s*:\s*"Article"/.test(source)
    || /<meta[^>]+property=["']og:type["'][^>]+content=["']article/i.test(source);
}

function bodyText(source) {
  const body = source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || source;
  return body
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasGoogleAdCode(source) {
  return /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js|\badsbygoogle\b/i.test(source);
}

function canonical(source) {
  return source.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || null;
}

function title(source) {
  return source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null;
}

function description(source) {
  return source.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] || null;
}

function sitemapEntries(source) {
  return new Set([...source.matchAll(/<loc>\s*(https:\/\/study-quest\.net\/[^<\s]+)\s*<\/loc>/gi)]
    .map((match) => new URL(match[1]).pathname.replace(/^\//, '') || 'index.html'));
}

function formatList(items, fallback = 'なし') {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : fallback;
}

async function rootHtml() {
  return (await fs.readdir(ROOT)).filter((name) => name.endsWith('.html')).sort();
}

async function main() {
  const options = parseArgs();
  const files = await rootHtml();
  const pages = new Map(await Promise.all(files.map(async (file) => [
    file, await fs.readFile(path.join(ROOT, file), 'utf8'),
  ])));
  const sitemap = sitemapEntries(await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8'));
  const index = pages.get('index.html') || '';
  const articles = files.filter((file) => isArticle(pages.get(file)));
  const adPages = files.filter((file) => hasGoogleAdCode(pages.get(file)));
  const protectedAds = NON_MONETIZED_PAGES
    .filter((file) => !pages.has(file) || hasGoogleAdCode(pages.get(file)))
    .map((file) => pages.has(file) ? `${file}: Google広告コードあり` : `${file}: ファイルがない`);
  const trustIssues = [];
  for (const [file, label] of Object.entries(TRUST_PAGES)) {
    const source = pages.get(file);
    if (!source) {
      trustIssues.push(`${file}: 信頼ページがない`);
      continue;
    }
    if (!title(source)) trustIssues.push(`${file}: titleがない`);
    if (!description(source)) trustIssues.push(`${file}: meta descriptionがない`);
    if (canonical(source) !== `${SITE_ORIGIN}${file}`) trustIssues.push(`${file}: canonicalが正しくない`);
    if (!sitemap.has(file)) trustIssues.push(`${file}: sitemap未掲載`);
    if (!new RegExp(`href=["'][^"']*${file.replace('.', '\\.')}["']`, 'i').test(index)) {
      trustIssues.push(`${file}: index.htmlから到達できない`);
    }
    if (!title(source)?.includes(label)) trustIssues.push(`${file}: ページ名とtitleが対応しない`);
  }

  /* 3,000字はGoogleの最低基準ではなく、このサイトの既存判断である。
     ここでは自動で広告を消さず、再確認すべき候補としてだけ出す。 */
  const shortMonetized = adPages
    .filter((file) => isArticle(pages.get(file)))
    .map((file) => ({ file, chars: bodyText(pages.get(file)).length }))
    .filter((page) => page.chars < 3000)
    .sort((a, b) => a.chars - b.chars);
  const genericClosings = articles
    .filter((file) => /(?:いいねボタン|ポチッと押して)/.test(bodyText(pages.get(file))))
    .sort();
  const lowScopeProtected = NON_MONETIZED_PAGES.filter((file) => file !== 'about.html'
    && file !== 'contact.html' && file !== 'privacy.html' && file !== 'terms.html'
    && file !== 'app.html' && file !== 'game.html');
  const blockers = [...protectedAds, ...trustIssues];

  const report = `# AdSenseポリシー品質ゲート（${today()}）

## 目的

Googleの審査は広告コードを置いたURLだけでなくサイト全体を対象とする。ここでは公開ページを自動変更せず、広告を出さないと決めた面、運営者・連絡先等の信頼ページ、独自性改善の残数を同じ基準で確認する。

根拠:

- Google AdSense「アカウントが承認されませんでした」: 自動生成または独自性がほとんどないページに広告コードを置かないこと、十分な独自コンテンツと操作性を求める。
  https://support.google.com/adsense/answer/81904?hl=ja
- Google Publisher Policies「複製された画面」: 価値の追加なしに外部コンテンツをコピー・自動生成した画面へGoogle広告を配置できない。
  https://support.google.com/publisherpolicies/answer/11190248?hl=ja

## 判定

- ルートHTML: ${files.length}本（Article: ${articles.length}本）
- Google広告コードを含むページ: ${adPages.length}本
- 非収益化指定ページ: ${NON_MONETIZED_PAGES.length}本（薄い論点記事: ${lowScopeProtected.length}本）
- 非収益化指定への広告再混入: **${protectedAds.length}件**
- 信頼ページ（運営者・問い合わせ・プライバシー・利用規約）の必須表示・導線: **${trustIssues.length}件**
- 3,000字未満かつ広告コードあり: **${shortMonetized.length}本**（内部レビュー候補。Googleの文字数基準ではない）
- 定型「いいね」CTAを含むArticle: **${genericClosings.length}本**（独自性の改善残数。違反の自動断定ではない）

## 公開停止候補

${formatList(blockers)}

## 短い広告面の再確認候補

${formatList(shortMonetized.map((page) => `${page.file}: ${page.chars.toLocaleString('ja-JP')}字`))}

## 定型CTAの改善残数

${formatList(genericClosings)}

## 運用

\`--strict\` は「非収益化指定への広告再混入」と「信頼ページの必須表示・導線」のみを失敗として終了コード2を返す。文字数と定型CTAは、Googleが明示した閾値ではないため、一次情報・読者価値・既存稟議を確認する編集候補に留める。
`;

  const outputPath = path.join(options.outputDir, `${today()}-adsense-policy-gate.md`);
  if (options.write) {
    await fs.mkdir(options.outputDir, { recursive: true });
    await fs.writeFile(outputPath, report, 'utf8');
  }
  console.log(`${options.write ? 'Wrote' : 'Generated'}: ${outputPath}`);
  console.log(`Blockers=${blockers.length}, adPages=${adPages.length}, shortMonetized=${shortMonetized.length}, genericClosings=${genericClosings.length}`);
  if (options.strict && blockers.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
