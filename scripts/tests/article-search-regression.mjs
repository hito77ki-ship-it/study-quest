import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const widget = readFileSync(new URL('../../article-widgets.js', import.meta.url), 'utf8');
const start = widget.indexOf('const SEARCH_INDEX_STATE =');
const end = widget.indexOf('function searchCardHTML(', start);
assert.ok(start >= 0 && end > start, 'The shared article search index must be present.');

const revision = widget.match(/const SEARCH_DATA_REVISION = '([0-9a-f]{64})';/)[1];
const indexURL = 'article-search-index.json?v=' + revision;

function articleSearch(fetchArticle, articles = {
  'mos.html': {label:'MOS', title:'MOSの準備'},
  'stats.html': {label:'ITパスポート', title:'注文の集計'}
}, fetchIndex = async () => ({ok:false})){
  const context = vm.createContext({
    ARTICLES: articles,
    fetch: file => file === indexURL ? fetchIndex(file) : fetchArticle(file)
  });
  vm.runInContext(widget.slice(start, end), context);
  // The fixture bodies are already plain text. These tests cover indexing and lookup.
  vm.runInContext("extractSearchArticleData = text => ({text, description:'', modified:''});", context);
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

test('the modal lists titles without fetching until a nonblank search, and retries only missing bodies after reopening', async () => {
  let failMOS = true;
  let indexRequests = 0;
  const reads = [];
  const search = articleSearch(async file => {
    reads.push(file);
    if(file === 'mos.html' && failMOS) return {ok:false};
    return {ok:true, text:async () => file === 'mos.html' ? '備品の発送表' : 'Excelで注文を分析'};
  }, undefined, async ()=>{ indexRequests++; return {ok:false}; });
  function control(){
    const listeners = new Map();
    return {
      addEventListener: (name, listener) => listeners.set(name,listener),
      dispatch: (name, event={}) => listeners.get(name)(event),
      focus() {}
    };
  }
  const button=control(), input=control(), filters=control(), overlay=control(), results={};
  const classes=new Set();
  const dialog={
    classList:{add:name=>classes.add(name), remove:name=>classes.delete(name), contains:name=>classes.has(name)},
    querySelector:selector=>({'.sq-search-input':input,'.sq-search-filters':filters,'.sq-search-results':results,'.sq-search-overlay':overlay})[selector]
  };
  search.document={
    ...control(), body:{appendChild(){}},
    querySelector:()=>({querySelector:()=>null,appendChild(){}}),
    createElement:tag=>tag==='button' ? button : dialog
  };
  Object.assign(search, {setTimeout() {}, _escHtml:value=>value, searchCardHTML:item=>item.f});
  const modalStart=widget.indexOf('function buildSearchModal(){');
  const modalEnd=widget.indexOf('function buildSearchResultsPage(){',modalStart);
  vm.runInContext(widget.slice(modalStart,modalEnd)+'\nbuildSearchModal()',search);
  function type(value){ input.value=value;input.dispatch('input'); }

  button.dispatch('click');
  assert.match(results.innerHTML,/mos\.html/);
  type('　 ');overlay.dispatch('click');button.dispatch('click');
  assert.deepEqual(reads,[]);
  assert.equal(indexRequests,0);
  type('Ｅｘｃｅｌ');type('Ｅｘｃｅｌで');
  assert.match(results.innerHTML,/検索しています/);
  await search.ensureArticleSearchIndex();
  assert.match(results.innerHTML,/stats\.html/);
  assert.deepEqual(reads,['mos.html','stats.html']);

  failMOS = false;
  overlay.dispatch('click');button.dispatch('click');
  assert.equal(reads.length,2);
  assert.equal(indexRequests,1);
  type('発送表');
  await search.ensureArticleSearchIndex();
  assert.equal(results.innerHTML,'mos.html');
  assert.deepEqual(reads,['mos.html','stats.html','mos.html']);
});

function record(text, modified='2026-11-19'){
  return {text, description:'記事の内容', modified};
}

function bundle(articles, header={}){
  return {ok:true, json:async ()=>({schema:1, revision, articles, ...header})};
}

test('one shared index request supplies all bodies, original metadata and excerpts in roster order', async () => {
  const calls = [];
  let release;
  const gate = new Promise(resolve=>{release=resolve;});
  const search = articleSearch(file=>{ calls.push(file); return {ok:false}; }, undefined, async url=>{
    calls.push(url);
    await gate;
    return bundle({
      'stats.html': record('分析した注文とＥｘｃｅｌ', ''),
      'mos.html': record('注文の発送表をExcelで照合'),
      'other.html': record('名簿外の語'),
    });
  });
  assert.equal(search.getSearchEntries('MOS').entries[0].f,'mos.html');
  assert.deepEqual(calls,[]);
  const first = search.ensureArticleSearchIndex();
  assert.equal(search.ensureArticleSearchIndex(true),first);
  assert.equal(search.getSearchEntries('発送表').loading,true);
  release();
  await first;
  const found=search.getSearchEntries('ｅｘｃｅｌ');
  assert.deepEqual(Array.from(found.entries,item=>item.f),['mos.html','stats.html']);
  assert.equal(found.incomplete,false);
  assert.equal(found.entries[0].description,'記事の内容');
  assert.equal(search.formatSearchModifiedDate(found.entries[0].modified),'最終更新 2026年11月19日');
  assert.equal(found.entries[1].modified,'');
  assert.match(search.createSearchExcerpt(found.entries[0].text,'発送表'),/発送表をExcelで照合/);
  assert.equal(search.getSearchEntries('名簿外の語').entries.length,0);
  await search.ensureArticleSearchIndex(true);
  assert.deepEqual(calls,[indexURL]);
});

test('missing and malformed individual records use only their canonical HTML fallback', async () => {
  const bad = {
    'empty.html': record('　 '),
    'number.html': {...record('索引のみの語'), description:3},
    'no-description.html': {text:'索引のみの語',modified:''},
    'invalid-date.html': record('索引のみの語','2026-02-30'),
    'wrong-text.html': {...record('索引のみの語'),text:[]},
    'too-long.html': record('長'.repeat(12001)),
  };
  const files = ['valid.html','missing.html',...Object.keys(bad)];
  const articles = Object.fromEntries(files.map(f=>[f,{label:'演習', title:f}]));
  const calls = [];
  const search = articleSearch(async f=>{
    calls.push(f);
    return {ok:true,text:async()=> '正規HTMLからの語'};
  }, articles, async url=>{
    calls.push(url);
    return bundle({'valid.html':record('有効な索引の語'), ...bad});
  });
  await search.ensureArticleSearchIndex();
  assert.deepEqual(calls,[indexURL,...files.slice(1)]);
  assert.deepEqual(Array.from(search.getSearchEntries('有効な索引の語').entries,item=>item.f),['valid.html']);
  assert.equal(search.getSearchEntries('正規HTMLからの語').entries.length,files.length-1);
  assert.equal(search.getSearchEntries('索引のみの語').entries.length,0);
  assert.equal(search.getSearchEntries('その他').incomplete,false);
});

test('wrong revision, schema or shape, unreadable JSON and failed HTTP retain the individual fallback', async () => {
  const stale={'mos.html':record('古い索引の語')};
  const wrongRevision = revision === 'a'.repeat(64) ? 'b'.repeat(64) : 'a'.repeat(64);
  for(const response of [
    bundle(stale,{revision:wrongRevision}), bundle(stale,{schema:2}),
    bundle([]), bundle(null), {ok:true,json:async()=>{ throw new SyntaxError('HTML offline response'); }},
    {ok:false},
  ]){
    const calls=[];
    const search=articleSearch(async file=>{ calls.push(file);return {ok:true,text:async()=>'原本の語'}; },
      undefined, async ()=>response);
    await search.ensureArticleSearchIndex();
    assert.deepEqual(calls,['mos.html','stats.html']);
    assert.equal(search.getSearchEntries('古い索引の語').entries.length,0);
    assert.equal(search.getSearchEntries('原本の語').entries.length,2);
  }
});

test('retry can recover the published index after an offline visit without overwriting cached HTML', async () => {
  const calls=[];
  let online=false;
  const search=articleSearch(async file=>{
    calls.push(file);
    return file==='mos.html' ? {ok:true,text:async()=>'保存した原本の語'} : {ok:false};
  },undefined,async url=>{
    calls.push(url);
    if(!online) throw Error('offline');
    return bundle({'mos.html':record('読み直さない索引の語'),'stats.html':record('復帰後の語')});
  });
  await search.ensureArticleSearchIndex();
  assert.equal(search.getSearchEntries('復帰後の語').incomplete,true);
  online=true;
  await search.ensureArticleSearchIndex(true);
  assert.deepEqual(calls,[indexURL,'mos.html','stats.html',indexURL]);
  assert.equal(search.getSearchEntries('保存した原本の語').entries[0].f,'mos.html');
  assert.equal(search.getSearchEntries('読み直さない索引の語').entries.length,0);
  assert.equal(search.getSearchEntries('復帰後の語').entries[0].f,'stats.html');
  assert.equal(search.getSearchEntries('復帰後の語').incomplete,false);
});

test('retry after a partial index only reads the still missing HTML', async () => {
  const calls=[];
  let online=false;
  const search=articleSearch(async file=>{
    calls.push(file);
    return {ok:online,text:async()=>'復帰した原本の語'};
  },undefined,async url=>{calls.push(url);return bundle({'mos.html':record('索引の語')});});
  await search.ensureArticleSearchIndex();
  assert.equal(search.getSearchEntries('復帰した原本の語').incomplete,true);
  online=true;
  await search.ensureArticleSearchIndex(true);
  assert.deepEqual(calls,[indexURL,'stats.html','stats.html']);
  assert.equal(search.getSearchEntries('復帰した原本の語').incomplete,false);
  assert.equal(search.getSearchEntries('復帰した原本の語').entries[0].f,'stats.html');
});
