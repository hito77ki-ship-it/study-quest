import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const searchScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .find(script => script.includes("getElementById('lp-search-modal')"));
assert.ok(searchScript, 'The homepage search must be present.');

function search(query, category = 'all', cards) {
  // Exercise the same filter and result markup used in the homepage dialog.
  const renderSource = searchScript.slice(
    searchScript.indexOf('  function normalizeSearchText('),
    searchScript.indexOf("  openBtn.addEventListener('click', open)"),
  );
  const results = { innerHTML: '', querySelectorAll: () => [] };
  const inputs = {
    index: cards ?? [
      { title: 'MOSの受験準備', label: '大学生・社会人', href: 'mos.html' },
      { title: '英検準2級', label: '英語資格', href: 'eiken-jun2.html' },
      { title: '二級建築士の準備', note: '受験・登録・製図を分ける', label: '大学生・社会人', href: 'kenchiku.html' },
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
  assert.match(search('mos', '英語資格'), /英語資格.*タイトル・紹介文・カテゴリがありません/);
  assert.match(search(''), /href="mos\.html"/);
  assert.match(search('該当しない架空の用語'), /タイトル・紹介文・カテゴリに.*候補はありません/);
  for (const category of ['all', '英語資格']) {
    assert.match(search('簿記2級 先入先出法', category), /本文まで探すには「全カテゴリの本文も検索」を押してください/);
  }
  assert.doesNotMatch(search('mos'), /本文まで探すには/);
});

test('a query that appears in a card description reveals that description', () => {
  const result = search('製図');
  assert.match(result, /href="kenchiku\.html"/);
  assert.match(result, /class="lp-search-note">受験・登録・製図を分ける/);
  assert.doesNotMatch(search('製図', '英語資格'), /href="kenchiku\.html"/);
});

test('the 12 results retain title and category matches before description-only matches', () => {
  const notes = Array.from({length: 13}, (_, i) => ({
    href: `note-${i}.html`, title: `資料${i}`, label: '学習継続', note: '独学の手順',
  }));
  const primary = [
    { href: 'category.html', title: '手順', label: '独学', note: '' },
    { href: 'title.html', title: '独学の計画', label: '学習継続', note: '独学の例' },
  ];
  const cards = [...notes.slice(0, 8), primary[0], ...notes.slice(8), primary[1]];
  const found = [...search('独学', 'all', cards).matchAll(/href="([^"]+)"/g)]
    .map(match => match[1]);
  assert.deepEqual(found, [...primary, ...notes.slice(0, 10)].map(card => card.href));
});

test('spaced terms may span card fields, after all existing phrase matches', () => {
  const cards = [
    {href:'note.html', label:'FP', title:'FP3級の資金計画', note:'積立に使う係数'},
    {href:'title.html', label:'FP3級', title:'積立に使う係数', note:''},
    {href:'phrase-note.html', label:'FP', title:'試験準備', note:'FP3級 係数'},
    {href:'phrase.html', label:'FP', title:'FP3級 係数', note:''},
    {href:'one-word.html', label:'FP', title:'FP3級の準備', note:'日程'},
  ];
  const hrefs = html => Array.from(html.matchAll(/href="([^"]+)"/g), m => m[1]);
  const found = search('ｆｐ３級　　係数', 'all', cards);
  assert.deepEqual(hrefs(found), ['phrase.html','phrase-note.html','title.html','note.html']);
  assert.match(found, /class="lp-search-note">積立に使う係数/);
  assert.deepEqual(hrefs(search('係数 FP3級','FP3級',cards)), ['title.html']);
  assert.deepEqual(hrefs(search('係数 手数料','all',cards)), []);
  const more = Array.from({length:15}, (_,i)=>({...cards[0],href:'split-'+i+'.html'}));
  assert.equal(hrefs(search('FP3級 係数','all',[...more,cards[3]]))[0],'phrase.html');
  assert.equal(hrefs(search('FP3級 係数','all',[...more,cards[3]])).length,12);
});
