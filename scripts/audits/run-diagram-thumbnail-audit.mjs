#!/usr/bin/env node

/**
 * 記事カード用の図解サムネイルが、台帳・生成ファイル・表示実装の三層で
 * そろっていることを読むだけで検査する。公開ページや記事本文は変更しない。
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const widgetsPath = path.join(root, 'article-widgets.js');
const diagramsDir = path.join(root, 'images/article-diagrams');
const widgets = fs.readFileSync(widgetsPath, 'utf8');
const articleMatch = widgets.match(/const ARTICLES = (\{[\s\S]*?\n\});\n\n\/\*/);
if (!articleMatch) throw new Error('ARTICLES台帳を読み取れません。');
const articles = vm.runInNewContext(`(${articleMatch[1]})`);
const manifest = JSON.parse(fs.readFileSync(path.join(diagramsDir, 'manifest.json'), 'utf8'));
const articleFiles = Object.keys(articles).sort();
const manifestFiles = manifest.map(item => item.file).sort();
const missing = articleFiles.filter(file => !fs.existsSync(path.join(diagramsDir, `${file.replace(/\.html$/, '')}.svg`)));
const invalid = articleFiles.filter(file => {
  const svgPath = path.join(diagramsDir, `${file.replace(/\.html$/, '')}.svg`);
  if (!fs.existsSync(svgPath)) return false;
  const svg = fs.readFileSync(svgPath, 'utf8');
  return !svg.includes('<svg') || !svg.includes('<title') || !svg.includes('viewBox="0 0 640 360"');
});
const manifestMismatch = articleFiles.length !== manifestFiles.length
  || articleFiles.some((file, index) => file !== manifestFiles[index]);
const implementationIssues = [
  ['共通記事カード', /function diagramThumbPath\(slug\)/.test(widgets) && /const src = diagramThumb \|\| a\?\.thumb/.test(widgets)],
  ['記事ヒーロー', /image\.src = diagramThumbPath\(slug\)/.test(widgets)],
  ['トップ一覧', fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('images/article-diagrams/${slug}.svg')],
  ['あなたにおすすめ', fs.readFileSync(path.join(root, 'article-recommendations.js'), 'utf8').includes('images/article-diagrams/${esc(article.id.replace(/\\.html$/, \'\'))}.svg')],
].filter(([, ok]) => !ok).map(([name]) => name);

const result = {
  articles: articleFiles.length,
  manifest: manifest.length,
  missing,
  invalid,
  manifestMismatch,
  implementationIssues,
};
console.log(JSON.stringify(result, null, 2));
if (missing.length || invalid.length || manifestMismatch || implementationIssues.length) process.exitCode = 1;
