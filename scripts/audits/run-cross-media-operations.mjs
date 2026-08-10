#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const studyRoot = process.env.STUDY_ROOT || process.cwd();
const fanzaRoot = process.env.FANZA_ROOT || '/Users/hitoki/fanza-affiliate';
const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
const relativeFiles = [
  'company/knowledge/20260810-メディア運営共通知識.md',
  'company/knowledge/20260810-メディア運営自動化ループ.md',
  'company/knowledge/20260810-共通知識同期チェック仕様.md',
  'company/metrics/20260810-共通KPIスキーマ.md',
  'company/strategy/20260810-メディア運営システム統合計画.md',
];

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function gitState(root) {
  if (!fs.existsSync(path.join(root, '.git'))) return { available: false, dirty: null };
  const result = spawnSync('git', ['-C', root, 'status', '--porcelain'], { encoding: 'utf8' });
  return {
    available: result.status === 0,
    dirty: result.status === 0 ? result.stdout.trim().split('\n').filter(Boolean).length : null,
  };
}

function projectLabel(root) {
  return root === studyRoot ? 'Study Quest' : 'FANZA Affiliate Lab';
}

const lines = [
  `# 共通知識同期チェック（${date}）`,
  '',
  `実行日時: ${new Date().toISOString()}`,
  `Study Quest: ${studyRoot}`,
  `FANZA Affiliate Lab: ${fanzaRoot}`,
  '',
  '## 判定',
  '',
];

let drift = 0;
for (const relative of relativeFiles) {
  const studyFile = path.join(studyRoot, relative);
  const fanzaFile = path.join(fanzaRoot, relative);
  const studyExists = fs.existsSync(studyFile);
  const fanzaExists = fs.existsSync(fanzaFile);
  if (!studyExists || !fanzaExists) {
    lines.push(`- **欠落**: \`${relative}\`（Study Quest=${studyExists ? 'あり' : 'なし'} / FANZA=${fanzaExists ? 'あり' : 'なし'}）`);
    drift += 1;
    continue;
  }
  const studyHash = sha256(studyFile);
  const fanzaHash = sha256(fanzaFile);
  if (studyHash === fanzaHash) {
    lines.push(`- **一致**: \`${relative}\`（${studyHash.slice(0, 12)}）`);
  } else {
    lines.push(`- **差分**: \`${relative}\`（Study Quest=${studyHash.slice(0, 12)} / FANZA=${fanzaHash.slice(0, 12)}）`);
    drift += 1;
  }
}

const studyGit = gitState(studyRoot);
const fanzaGit = gitState(fanzaRoot);
lines.push('', '## Git状態', '');
lines.push(`- ${projectLabel(studyRoot)}: ${studyGit.available ? 'Git管理あり' : 'Git管理なし'} / 未コミット変更 ${studyGit.dirty ?? '不明'}件`);
lines.push(`- ${projectLabel(fanzaRoot)}: ${fanzaGit.available ? 'Git管理あり' : 'Git管理なし'} / 未コミット変更 ${fanzaGit.dirty ?? '不明'}件`);
lines.push('', '## 次の判断', '');
if (drift === 0 && fanzaGit.available) {
  lines.push('差分・欠落なし。同期状態は正常。自動同期は行わず、次回監査まで記録のみとする。');
} else {
  lines.push(`差分・欠落 ${drift}件、またはGit状態の確認が必要。自動上書きはせず、各事業の承認フローで扱う。`);
}

for (const root of [studyRoot, fanzaRoot]) {
  const reportDir = path.join(root, 'company/reports');
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, `${date}-共通知識同期チェック.md`), `${lines.join('\n')}\n`);
}

console.log(lines.join('\n'));
