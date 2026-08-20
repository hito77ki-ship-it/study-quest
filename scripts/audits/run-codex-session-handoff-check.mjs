#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');
const targetArgument = process.argv[2];
const requiredSections = ['タスク', '現在の目標', '完了済み', '採用しなかった案', '決定と制約', '作業状態', '未解決事項', '次の一手'];

if (!targetArgument) {
  console.error('Usage: node scripts/audits/run-codex-session-handoff-check.mjs <repository-relative-markdown-path>');
  process.exit(2);
}

const target = path.resolve(repositoryRoot, targetArgument);
if (!target.startsWith(`${repositoryRoot}${path.sep}`) || !target.endsWith('.md') || !fs.existsSync(target)) {
  console.error('対象はリポジトリ内に存在するMarkdownファイルを指定してください。');
  process.exit(2);
}

const text = fs.readFileSync(target, 'utf8');
const missingSections = requiredSections.filter((section) => !text.includes(`## ${section}`));
console.log(JSON.stringify({
  target: path.relative(repositoryRoot, target),
  missingSections,
  readyForHandoff: missingSections.length === 0,
  note: '形式確認のみ。未コミット差分、承認境界、未解決事項が正しいかは人が確認する。',
}, null, 2));
if (missingSections.length) process.exitCode = 1;
