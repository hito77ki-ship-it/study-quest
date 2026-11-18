import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const widget = readFileSync(new URL('../../article-widgets.js', import.meta.url), 'utf8');
const start = widget.indexOf('const SEARCH_INDEX_STATE =');
const end = widget.indexOf('function searchCardHTML(', start);
assert.ok(start >= 0 && end > start, 'The shared article search index must be present.');

function articleSearch(fetch, articles = {
  'mos.html': {label:'MOS', title:'MOSの準備'},
  'stats.html': {label:'ITパスポート', title:'注文の集計'}
}){
  const context = vm.createContext({
    ARTICLES: articles,
    fetch
  });
  vm.runInContext(widget.slice(start, end), context);
  // The fixture bodies are already plain text. These tests cover indexing and lookup.
  vm.runInContext('extractSearchArticleData = text => ({text});', context);
  return context;
}

test('full-width letters and half-width kana find the same article and matching excerpt', async () => {
  const search = articleSearch(async file => ({
    ok:true,
    text:async () => file === 'mos.html' ? '発送表をExcelで照合' : '資料の前処理'
  }));
  await search.ensureArticleSearchIndex();
  for(const [query,file] of [['ｍＯＳ','mos.html'],['Ｅｘｃｅｌ','mos.html'],['ﾊﾟｽﾎﾟｰﾄ','stats.html']]){
    assert.deepEqual(Array.from(search.getSearchEntries(query).entries, row=>row.f),[file]);
  }
  const passage='前段の説明。'.repeat(30)+'注文をExcelで集計します。';
  assert.match(search.createSearchExcerpt(passage,'Ｅｘｃｅｌ'),/注文をExcelで集計/);
  assert.match(search.createSearchExcerpt('点検対象は㈱みどりの担当です。','(株)みどり'),/\(株\)みどり/);
});

test('a waiting body, an unavailable body, and a completed search with no match are distinct', async () => {
  const reads = [];
  let release;
  const pending = new Promise(resolve=>{release=resolve;});
  const search = articleSearch(async file => {
    reads.push(file);
    await pending;
    if(file === 'mos.html') return {ok:false,text:async()=> '障害ページ固有の言葉'};
    return {ok:true,text:async()=> '注文ログの7行'};
  });
  const index = search.ensureArticleSearchIndex();
  assert.equal(search.ensureArticleSearchIndex(),index);
  const waiting=search.getSearchEntries('注文ログの7行');
  assert.equal(waiting.loading,true);
  assert.equal(waiting.entries.length,0);
  assert.notEqual(search.searchCoverageNotice(waiting.loading,waiting.incomplete),'');
  release();
  await index;
  const found=search.getSearchEntries('注文ログの7行');
  assert.deepEqual(Array.from(found.entries,row=>row.f),['stats.html']);
  assert.equal(found.incomplete,true);
  const missing=search.getSearchEntries('障害ページ固有の言葉','MOS');
  assert.equal(missing.entries.length,0);
  assert.equal(missing.loading,false);
  assert.equal(missing.incomplete,true);
  const none=search.getSearchEntries('存在しない例','ITパスポート');
  assert.equal(none.entries.length,0);
  assert.equal(search.searchCoverageNotice(none.loading,none.incomplete),'');
  assert.equal(search.getSearchEntries('ＭＯＳ').entries[0].f,'mos.html');
  await search.ensureArticleSearchIndex();
  assert.deepEqual(reads.sort(),['mos.html','stats.html']);
});

test('the index limits concurrent article requests and reaches every entry after a failure', async () => {
  const articles = Object.fromEntries(Array.from({length:20}, (_,i)=>[
    `lesson-${i}.html`, {label:'練習', title:`第${i}問`}
  ]));
  let inFlight = 0;
  let maximum = 0;
  let total = 0;
  const search = articleSearch(async file=>{
    total++;
    maximum=Math.max(maximum, ++inFlight);
    await new Promise(resolve=>setImmediate(resolve));
    inFlight--;
    if(file==='lesson-0.html') throw Error('Connection lost');
    return {ok:true,text:async()=> '検算できます'};
  }, articles);
  await search.ensureArticleSearchIndex();
  assert.equal(total,20);
  assert.ok(maximum > 1 && maximum <= 6);
  assert.equal(search.getSearchEntries('検算できます').entries.length,19);
  assert.equal(search.getSearchEntries('検算できます').incomplete,true);
});

test('submitting again retries only unread bodies, and clears the partial result after recovery', async () => {
  const reads = [];
  let online = false;
  const search = articleSearch(async file=>{
    reads.push(file);
    if(file==='stats.html' && !online) return {ok:false};
    return {ok:true,text:async()=> '注文ログの7行'};
  });
  await search.ensureArticleSearchIndex();
  assert.equal(search.getSearchEntries('注文ログの7行').incomplete,true);
  online = true;
  await search.ensureArticleSearchIndex();
  assert.equal(reads.length,2);
  await search.ensureArticleSearchIndex(true);
  assert.deepEqual(reads,['mos.html','stats.html','stats.html']);
  const result=search.getSearchEntries('注文ログの7行');
  assert.equal(result.entries.length,2);
  assert.equal(result.incomplete,false);
});

test('an offline placeholder or another canonical page is not indexed as the requested article', () => {
  class DOMParser {
    parseFromString(canonical){
      return {
        querySelector(selector){
          if(selector==='link[rel~="canonical"]') return canonical ? {getAttribute:()=>canonical} : null;
          if(selector==='main,.container,article') return {textContent:'取引番号で銀行明細を照合'};
          return null;
        },
        querySelectorAll(){return [];}
      };
    }
  }
  const search=vm.createContext({DOMParser,URL});
  vm.runInContext(widget.slice(start,end),search);
  assert.equal(search.extractSearchArticleData('', 'bank.html'),null);
  assert.equal(search.extractSearchArticleData('https://study-quest.net/other.html', 'bank.html'),null);
  assert.match(search.extractSearchArticleData('https://study-quest.net/bank.html', 'bank.html').text,/銀行明細/);
});
