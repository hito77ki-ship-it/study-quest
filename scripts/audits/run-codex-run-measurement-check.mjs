#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');
const targetArgument = process.argv[2];
const requireMeasurements = process.argv.includes('--require-measurements');
const requiredSections = ['比較する代表タスク', '構成', '観測値', '品質判定', '判定'];

if (!targetArgument || targetArgument.startsWith('--')) {
  console.error('Usage: node scripts/audits/run-codex-run-measurement-check.mjs <repository-relative-markdown-path> [--require-measurements]');
  process.exit(2);
}

const target = path.resolve(repositoryRoot, targetArgument);
if (!target.startsWith(`${repositoryRoot}${path.sep}`) || !target.endsWith('.md') || !fs.existsSync(target)) {
  console.error('対象はリポジトリ内に存在するMarkdownファイルを指定してください。');
  process.exit(2);
}

const text = fs.readFileSync(target, 'utf8');
const missingSections = requiredSections.filter((section) => !text.includes(`## ${section}`));
const unmeasuredFields = [...text.matchAll(/\|\s*([^|]+?)\s*\|\s*未取得\s*\|\s*未取得\s*\|/g)].map((match) => match[1].trim());
const readyForComparison = missingSections.length === 0 && unmeasuredFields.length === 0;
console.log(JSON.stringify({
  target: path.relative(repositoryRoot, target),
  missingSections,
  unmeasuredFields,
  readyForComparison,
  note: '未取得は正しい記録であり、値を推測して埋めない。--require-measurements は比較結果を採用する前だけ使う。',
}, null, 2));
if (missingSections.length || (requireMeasurements && unmeasuredFields.length)) process.exitCode = 1;
