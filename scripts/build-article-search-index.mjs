import { createHash, randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { extractArticle } from './article-search-index/extract.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const widgetPath = path.join(root, 'article-widgets.js');
const indexPath = path.join(root, 'article-search-index.json');
const command = 'node scripts/build-article-search-index.mjs';
const args = process.argv.slice(2);
if (args.length > 1 || (args.length && args[0] !== '--check')) throw new Error(`Usage: ${command} [--check]`);

function articleFiles(source) {
  // The same catalog literal drives search, article cards and the diagram audit.
  const literal = source.match(/^const ARTICLES = (\{[\s\S]*?^\});/m)?.[1];
  if (!literal) throw new Error('ARTICLES catalog not found in article-widgets.js');
  const files = Object.keys(vm.runInNewContext(`(${literal})`, {}, { timeout: 1000 }));
  if (!files.length || files.some(file => !/^[a-zA-Z0-9_-]+\.html$/.test(file))) {
    throw new Error('ARTICLES must contain local article filenames');
  }
  return files;
}

const files = articleFiles(fs.readFileSync(widgetPath, 'utf8'));
const articles = {};
for (const file of files) {
  try {
    articles[file] = extractArticle(fs.readFileSync(path.join(root, file), 'utf8'), file);
  } catch (error) {
    throw new Error(`${file}: ${error.message}`, { cause: error });
  }
}
const revision = createHash('sha256').update(JSON.stringify(articles), 'utf8').digest('hex');
const rows = files.map(file => `    ${JSON.stringify(file)}:${JSON.stringify(articles[file])}`);
const output = `{\n  "schema": 1,\n  "revision": "${revision}",\n  "articles": {\n${rows.join(',\n')}\n  }\n}\n`;

// Read the widget again after generating the corpus. Update only its fixed-size revision
// so unrelated edits to the widget are not replaced with a previous copy of the source.
const checkOnly = args[0] === '--check';
const fd = fs.openSync(widgetPath, checkOnly ? 'r' : 'r+');
try {
  const current = fs.readFileSync(fd, 'utf8');
  if (JSON.stringify(articleFiles(current)) !== JSON.stringify(files)) throw new Error('ARTICLES changed while indexing; rerun the generator');
  const matches = [...current.matchAll(/^const SEARCH_DATA_REVISION = '([a-f0-9]{64})';$/gm)];
  if (matches.length !== 1) throw new Error('Expected exactly one 64-character SEARCH_DATA_REVISION declaration');
  const oldRevision = matches[0][1];
  const sameIndex = fs.existsSync(indexPath) && fs.readFileSync(indexPath, 'utf8') === output;
  if (checkOnly && (!sameIndex || oldRevision !== revision)) throw new Error(`Search data or SEARCH_DATA_REVISION is stale; run ${command}`);

  if (!sameIndex) {
    const temporary = `${indexPath}.${randomUUID()}.tmp`;
    try {
      fs.writeFileSync(temporary, output, { flag: 'wx' });
      fs.renameSync(temporary, indexPath);
    } finally {
      fs.rmSync(temporary, { force: true });
    }
  }
  if (oldRevision !== revision) {
    const position = Buffer.byteLength(current.slice(0, matches[0].index) + "const SEARCH_DATA_REVISION = '");
    const oldBytes = Buffer.alloc(64);
    fs.readSync(fd, oldBytes, 0, oldBytes.length, position);
    if (oldBytes.toString() !== oldRevision) throw new Error('Widget changed while indexing; rerun the generator');
    fs.writeSync(fd, revision, position, 'utf8');
  }
} finally {
  fs.closeSync(fd);
}
console.log(`${checkOnly ? 'PASS' : 'Built'} article search index: ${files.length} articles, SHA-256 ${revision}`);
