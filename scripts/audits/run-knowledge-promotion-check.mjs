#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');
const relativeTarget = process.argv[2];

if (!relativeTarget) {
  console.error('Usage: node scripts/audits/run-knowledge-promotion-check.mjs <repository-relative-markdown-path>');
  process.exit(2);
}

const target = path.resolve(repositoryRoot, relativeTarget);
if (!target.startsWith(`${repositoryRoot}${path.sep}`) || !target.endsWith('.md') || !fs.existsSync(target)) {
  console.error('対象はリポジトリ内に存在するMarkdownファイルを指定してください。');
  process.exit(2);
}

const text = fs.readFileSync(target, 'utf8');
const requiredSections = ['適用条件', 'ルール', '根拠', '反証・除外', '最終確認日', '参照先', '判定'];
const missingSections = requiredSections.filter((section) => !text.includes(`## ${section}`));
const result = {
  target: path.relative(repositoryRoot, target),
  missingSections,
  eligibleForReview: missingSections.length === 0,
  note: 'これは形式確認のみ。昇格は独立事例、一次情報、承認根拠を人が確認してから行う。',
};
console.log(JSON.stringify(result, null, 2));
if (missingSections.length) process.exitCode = 1;
