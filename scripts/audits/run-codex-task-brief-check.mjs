#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');
const targetArgument = process.argv[2];
const requiredSections = ['目的', '対象と非対象', '権限境界', 'ツールの範囲', '必要な根拠と検証', '実行強度の選択'];

if (!targetArgument) {
  console.error('Usage: node scripts/audits/run-codex-task-brief-check.mjs <repository-relative-markdown-path>');
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
  readyForBriefing: missingSections.length === 0,
  note: '形式確認のみ。実際のツール選択と承認境界は作業内容に応じて埋める。',
}, null, 2));
if (missingSections.length) process.exitCode = 1;
