#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');
const options = { type: 'all', limit: 20, query: '' };

for (let index = 2; index < process.argv.length; index += 1) {
  const value = process.argv[index];
  if (value === '--type') options.type = process.argv[++index] ?? '';
  else if (value === '--limit') options.limit = Number(process.argv[++index]);
  else if (value === '--query') options.query = process.argv.slice(++index).join(' ');
  else options.query = [options.query, value].filter(Boolean).join(' ');
}

if (!['all', 'decisions', 'reports'].includes(options.type) || !Number.isInteger(options.limit) || options.limit < 1) {
  console.error('Usage: node scripts/audits/search-company-records.mjs [--type all|decisions|reports] [--limit N] [--query WORDS]');
  process.exit(2);
}

function collectMarkdown(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdown(entryPath);
    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

function parseRecord(file, type) {
  const text = fs.readFileSync(file, 'utf8');
  const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path.basename(file, '.md');
  const status = text.match(/^[-*]\s*ステータス\s*[:：]\s*(.+)$/m)?.[1]?.trim() ?? null;
  return {
    type,
    date: path.basename(file).match(/(20\d{6})/)?.[1] ?? null,
    title,
    status,
    path: path.relative(repositoryRoot, file),
    text,
  };
}

const recordTypes = options.type === 'all' ? ['decisions', 'reports'] : [options.type];
const records = recordTypes.flatMap((type) => collectMarkdown(path.join(repositoryRoot, 'company', type))
  .map((file) => parseRecord(file, type)));
const terms = options.query.toLocaleLowerCase('ja-JP').split(/\s+/).filter(Boolean);
const matches = records
  .map((record) => {
    const searchable = `${record.path}\n${record.title}\n${record.status ?? ''}\n${record.text}`.toLocaleLowerCase('ja-JP');
    const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
    const matched = terms.length === 0 || score === terms.length;
    const firstTerm = terms.find((term) => searchable.includes(term));
    const position = firstTerm ? searchable.indexOf(firstTerm) : 0;
    const snippet = terms.length === 0 ? null : record.text.replace(/\s+/g, ' ').slice(Math.max(0, position - 70), position + 170);
    return { ...record, score, matched, snippet };
  })
  .filter((record) => record.matched)
  .sort((a, b) => b.score - a.score || (b.date ?? '').localeCompare(a.date ?? '') || a.path.localeCompare(b.path))
  .slice(0, options.limit)
  .map(({ text, matched, ...record }) => record);

console.log(JSON.stringify({
  recordsScanned: records.length,
  type: options.type,
  query: options.query || null,
  results: matches,
}, null, 2));
