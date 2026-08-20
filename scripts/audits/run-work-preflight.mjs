#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');

function git(...args) {
  return execFileSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' }).trimEnd();
}

function collectMarkdown(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdown(entryPath);
    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

function recentRecords(directory, limit = 5) {
  return collectMarkdown(directory)
    .map((file) => {
      const text = fs.readFileSync(file, 'utf8');
      const date = path.basename(file).match(/(20\d{6})/)?.[1] ?? '';
      const status = text.match(/^[-*]\s*ステータス\s*[:：]\s*(.+)$/m)?.[1]?.trim() ?? null;
      const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path.basename(file, '.md');
      return { date, path: path.relative(repositoryRoot, file), title, status };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.path.localeCompare(a.path))
    .slice(0, limit);
}

const statusLines = git('status', '--porcelain=v1').split('\n').filter(Boolean);
const statusSummary = statusLines.reduce((summary, line) => {
  const [indexStatus, worktreeStatus] = line;
  if (line.startsWith('??')) summary.untracked += 1;
  else {
    if (indexStatus !== ' ') summary.staged += 1;
    if (worktreeStatus !== ' ') summary.unstaged += 1;
  }
  return summary;
}, { staged: 0, unstaged: 0, untracked: 0 });

const lockPath = path.resolve(repositoryRoot, git('rev-parse', '--git-path', 'index.lock'));
const requiredInstructions = ['AGENTS.md', 'CLAUDE.md'].map((file) => ({
  path: file,
  exists: fs.existsSync(path.join(repositoryRoot, file)),
}));
const result = {
  dateFromGit: git('log', '-1', '--date=iso', '--format=%ad'),
  branch: git('branch', '--show-current'),
  head: git('rev-parse', '--short', 'HEAD'),
  indexLockPresent: fs.existsSync(lockPath),
  workingTree: statusSummary,
  requiredInstructions,
  recentDecisions: recentRecords(path.join(repositoryRoot, 'company', 'decisions')),
  recentReports: recentRecords(path.join(repositoryRoot, 'company', 'reports')),
};

console.log(JSON.stringify(result, null, 2));

if (result.indexLockPresent || requiredInstructions.some((instruction) => !instruction.exists)) {
  process.exitCode = 1;
}
