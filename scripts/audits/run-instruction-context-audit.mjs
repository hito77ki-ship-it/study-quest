#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');
const sources = ['AGENTS.md', 'CLAUDE.md'].map((file) => ({
  file,
  text: fs.readFileSync(path.join(repositoryRoot, file), 'utf8'),
}));

function paragraphs(source) {
  const lines = source.text.split('\n');
  const blocks = [];
  let start = null;
  let current = [];
  const flush = () => {
    const raw = current.join('\n').trim();
    const normalized = raw.replace(/\s+/g, ' ').trim();
    if (start !== null && normalized.length >= 100 && !raw.startsWith('#') && !raw.startsWith('```') && !raw.startsWith('|')) {
      blocks.push({ file: source.file, line: start, chars: normalized.length, normalized, preview: normalized.slice(0, 120) });
    }
    start = null;
    current = [];
  };
  lines.forEach((line, index) => {
    if (!line.trim()) return flush();
    if (start === null) start = index + 1;
    current.push(line);
  });
  flush();
  return blocks;
}

function sections(source) {
  const lines = source.text.split('\n');
  const headings = lines
    .map((line, index) => ({ match: line.match(/^##\s+(.+)$/), line: index + 1 }))
    .filter((item) => item.match);
  return headings.map((heading, index) => ({
    title: heading.match[1],
    line: heading.line,
    bytes: Buffer.byteLength(lines.slice(heading.line - 1, headings[index + 1]?.line - 1).join('\n')),
  }));
}

const allParagraphs = sources.flatMap(paragraphs);
const byText = new Map();
for (const paragraph of allParagraphs) {
  const entries = byText.get(paragraph.normalized) ?? [];
  entries.push(paragraph);
  byText.set(paragraph.normalized, entries);
}
const duplicateParagraphs = [...byText.values()]
  .filter((entries) => new Set(entries.map((entry) => entry.file)).size > 1)
  .map((entries) => ({ preview: entries[0].preview, locations: entries.map(({ file, line, chars }) => ({ file, line, chars })) }));

const result = {
  contextBytes: Object.fromEntries(sources.map((source) => [source.file, Buffer.byteLength(source.text)])),
  sourceLines: Object.fromEntries(sources.map((source) => [source.file, source.text.split('\n').length])),
  duplicateLongParagraphs: duplicateParagraphs,
  largestSections: Object.fromEntries(sources.map((source) => [source.file, sections(source)
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5)])),
  note: '候補を報告するだけで、指示ファイルは変更しない。削除・統合は実例と承認を確認して別途判断する。',
};
result.contextBytes.total = Object.values(result.contextBytes).reduce((total, value) => total + value, 0);
console.log(JSON.stringify(result, null, 2));
