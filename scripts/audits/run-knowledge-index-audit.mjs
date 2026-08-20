#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');
const knowledgeDir = path.join(repositoryRoot, 'company', 'knowledge');
const indexPath = path.join(knowledgeDir, 'INDEX.md');
const protocolPath = path.join(knowledgeDir, '20260820-再利用知識の昇格と取得プロトコル.md');

const index = fs.readFileSync(indexPath, 'utf8');
const protocol = fs.readFileSync(protocolPath, 'utf8');
const markdownLinkPattern = /\]\(([^)#]+\.md)(?:#[^)]+)?\)/g;
const indexedPaths = new Set();
let match;

while ((match = markdownLinkPattern.exec(index)) !== null) {
  indexedPaths.add(path.resolve(knowledgeDir, match[1]));
}

const knowledgeFiles = fs.readdirSync(knowledgeDir)
  .filter((file) => file.endsWith('.md') && !['README.md', 'INDEX.md'].includes(file))
  .map((file) => path.join(knowledgeDir, file))
  .sort();

const missingFromIndex = knowledgeFiles
  .filter((file) => !indexedPaths.has(file))
  .map((file) => path.relative(repositoryRoot, file));
const missingReferences = [...indexedPaths]
  .filter((file) => !fs.existsSync(file))
  .map((file) => path.relative(repositoryRoot, file));

const requiredProtocolSections = [
  '## 昇格条件',
  '## 取得手順',
  '## 1件ずつ取り出す原則',
  '## 保存しないもの',
];
const protocolIssues = requiredProtocolSections
  .filter((section) => !protocol.includes(section))
  .map((section) => `不足: ${section}`);

const result = {
  knowledgeFiles: knowledgeFiles.length,
  indexedFiles: indexedPaths.size,
  missingFromIndex,
  missingReferences,
  protocolIssues,
  contextBytes: {
    agents: fs.statSync(path.join(repositoryRoot, 'AGENTS.md')).size,
    claude: fs.statSync(path.join(repositoryRoot, 'CLAUDE.md')).size,
  },
};

result.contextBytes.total = result.contextBytes.agents + result.contextBytes.claude;
console.log(JSON.stringify(result, null, 2));

if (missingFromIndex.length || missingReferences.length || protocolIssues.length) {
  process.exitCode = 1;
}
