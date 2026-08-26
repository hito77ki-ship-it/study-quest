#!/usr/bin/env node

/**
 * Study Quest claim-language audit.
 *
 * Public pages are never rewritten. This check extracts reader-facing
 * candidates for an editor to review against the article's evidence. It
 * deliberately separates an outcome guarantee from an instruction such as
 * "問題文を必ず確認する".
 *
 * Usage:
 *   node scripts/audits/run-claim-language-audit.mjs
 *   node scripts/audits/run-claim-language-audit.mjs --paths boki3-next-exam.html
 *   node scripts/audits/run-claim-language-audit.mjs --no-write
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_OUTPUT = path.join(ROOT, 'company', 'reports', 'automation');
const TODAY = process.env.AUDIT_DATE || new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date()).replaceAll('-', '');

const OUTCOME_PATTERNS = [
  /[^。！？]{0,55}(?:必ず|絶対に|確実に|間違いなく|100%)[^。！？]{0,55}(?:合格|受か|得点|点数|失点|ミス|理解|身につ|再現|伸び|上が|届)/g,
  /[^。！？]{0,55}(?:最短\s*)?\d+(?:[〜～]\d+)?時間[^。！？]{0,30}(?:合格でき|合格を狙|合格に届)/g,
  /[^。！？]{0,55}(?:必ず|絶対に|確実に|間違いなく)[^。！？]{0,40}(?:迷わ|迷いません|間違え|失敗し)/g,
  /[^。！？]{0,55}(?:合格率|点数|得点)[^。！？]{0,55}(?:爆上がり|激増|確実に[^。！？]{0,24}(?:上が|伸び))/g,
  /[^。！？]{0,55}(?:失点|ミス|間違い)[^。！？]{0,24}(?:ゼロになる|なくなる|しない)/g,
  /[^。！？]{0,55}(?:ほぼ)?必ず全問(?:取れる|正解できる)/g,
];

const SUPERLATIVE_PATTERNS = [
  /[^。！？]{0,55}(?:最強|最短|最も|最多|一瞬で|爆上がり|確実に合格)[^。！？]{0,55}/g,
];

function parseArgs() {
  const opts = { outputDir: DEFAULT_OUTPUT, paths: null, write: true };
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--paths') opts.paths = args[++index]?.split(',').map((item) => item.trim()).filter(Boolean);
    else if (args[index] === '--output-dir') opts.outputDir = path.resolve(args[++index]);
    else if (args[index] === '--no-write') opts.write = false;
    else throw new Error(`Unknown option: ${args[index]}`);
  }
  return opts;
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

function shorten(value, max = 180) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1)}…`;
}

function candidates(text, patterns) {
  const found = new Set();
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) found.add(shorten(match[0]));
  }
  return [...found];
}

function markdownList(items) {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : 'なし';
}

async function main() {
  const opts = parseArgs();
  const allFiles = (await fs.readdir(ROOT)).filter((file) => file.endsWith('.html')).sort();
  const requested = opts.paths || allFiles;
  const missing = requested.filter((file) => !allFiles.includes(file));
  if (missing.length) throw new Error(`Unknown root HTML file(s): ${missing.join(', ')}`);

  const rows = [];
  for (const file of requested) {
    const source = await fs.readFile(path.join(ROOT, file), 'utf8');
    if (!isArticle(source)) continue;
    const text = bodyText(source);
    const outcome = candidates(text, OUTCOME_PATTERNS);
    const superlative = candidates(text, SUPERLATIVE_PATTERNS)
      .filter((value) => !outcome.some((strong) => strong.includes(value) || value.includes(strong)));
    if (outcome.length || superlative.length) rows.push({ file, outcome, superlative });
  }

  const outcomeCount = rows.reduce((sum, row) => sum + row.outcome.length, 0);
  const superlativeCount = rows.reduce((sum, row) => sum + row.superlative.length, 0);
  const report = `# 成果保証・最上級表現の監査（${TODAY})

## 目的

公開記事を自動で書き換えず、読者の合格・得点・理解の結果を断定する表現と、根拠確認が必要な最上級表現を抽出する。出力は修正指示ではなく、本文・一次情報・記事の文脈を確認するための候補である。

## 判定

- 対象Article: ${requested.length}本中 ${rows.length}本に候補
- 成果保証候補: **${outcomeCount}件**
- 最上級・煽り候補: **${superlativeCount}件**

## 成果保証候補

${markdownList(rows.flatMap((row) => row.outcome.map((value) => `\`${row.file}\` — ${value}`)))}

## 最上級・煽り候補

${markdownList(rows.flatMap((row) => row.superlative.map((value) => `\`${row.file}\` — ${value}`)))}

## 除外するもの

- 「問題文を必ず確認する」のような、成果ではなく手順・試験要件への注意
- 「受験資格がなく誰でも受験できる」のような、公式事実を示す表現
- 「絶対に再現できない」のような、成果保証の否定
- 会計上の「保証」など、学習成果と無関係の用語

## 運用

1. 候補をそのまま一括置換しない。読者に約束している結果か、公式一次情報で裏付けられる比較かを確認する。
2. 誤り・無根拠な成果保証を直す場合は、記事のJSON-LD、表示更新日、sitemapの3面を同期し、変更を報告書に残す。
3. 記事の構成・説明方針を変える場合は、稟議フローを通す。
`;

  const outputPath = path.join(opts.outputDir, `${TODAY}-claim-language-audit.md`);
  if (opts.write) {
    await fs.mkdir(opts.outputDir, { recursive: true });
    await fs.writeFile(outputPath, report, 'utf8');
  }
  console.log(`${opts.write ? 'Wrote' : 'Generated'}: ${outputPath}`);
  console.log(`Outcome=${outcomeCount}, superlative=${superlativeCount}, files=${rows.length}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
