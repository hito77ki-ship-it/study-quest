import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const searchScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .find(script => script.includes("getElementById('lp-search-modal')"));
assert.ok(searchScript, 'The homepage search must be present.');

function search(query, category = 'all') {
  // Exercise the same filter and result markup used in the homepage dialog.
  const renderSource = searchScript.slice(
    searchScript.indexOf('  function normalizeSearchText('),
    searchScript.indexOf("  openBtn.addEventListener('click', open)"),
  );
  const results = { innerHTML: '', querySelectorAll: () => [] };
  const inputs = {
    index: [
      { title: 'MOSの受験準備', label: '大学生・社会人', href: 'mos.html' },
      { title: '英検準2級', label: '英語資格', href: 'eiken-jun2.html' },
    ],
    selectedLabel: category, results, query, esc: value => value,
  };
  vm.runInNewContext(renderSource + '\nrender(query);', inputs);
  return results.innerHTML;
}

test('MOS in full-width, half-width or mixed case returns the original article title', () => {
  for (const query of ['mos', 'ＭＯＳ', 'ｍｏｓ', 'MoS', '　ＭｏＳ　']) {
    assert.equal(search(query), search('MOS'));
  }
  assert.match(search('MOS'), /href="mos\.html"/);
  assert.match(search('mos'), /MOSの受験準備/);
});

test('search preserves category scope, Japanese, the empty query and no-match feedback', () => {
  assert.match(search('英検準２級'), /href="eiken-jun2\.html"/);
  assert.match(search('英語資格'), /href="eiken-jun2\.html"/);
  assert.match(search('mos', '大学生・社会人'), /href="mos\.html"/);
  assert.match(search('mos', '英語資格'), /一致する記事はありません/);
  assert.match(search(''), /href="mos\.html"/);
  assert.match(search('該当しない架空の用語'), /一致する記事はありません/);
});
