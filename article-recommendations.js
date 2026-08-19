(function(){
'use strict';

/*
 * 端末内だけで動く記事推薦の第1段階。
 * 保存するのは記事ID・テーマ・時刻だけで、名前や本文、外部への送信は扱わない。
 */
const PAGE = location.pathname.split('/').pop() || '';
const STORE_KEY = 'sq_personal_recommendations_v1';
const MAX_HISTORY = 30;

const TOPICS = [
  { id:'accounting', label:'簿記・会計', pattern:/簿記|会計|仕訳|原価|決算|財務|公認会計士|税理士|boki|cpa|zeirishi/i },
  { id:'legal', label:'法律資格', pattern:/宅建|行政書士|司法書士|社労士|不動産|民法|takken|gyosei|shihoshoshi|sharoshi/i },
  { id:'it', label:'IT資格', pattern:/ITパスポート|基本情報|応用情報|MOS|プログラミング|itp|\bfe\b|\bap\b|mos/i },
  { id:'english', label:'英語資格', pattern:/TOEIC|英検|IELTS|TOEFL|英語|toeic|eiken|ielts|toefl/i },
  { id:'finance', label:'お金・FP', pattern:/FP|金融|保険|年金|相続|fp3|\bfp\b/i },
  { id:'continuity', label:'学習継続', pattern:/続かない|挫折|再開|勉強時間|落ちた|再受験|モチベ|keizoku|zasetsu|ochita/i },
  { id:'career', label:'就職・転職', pattern:/就活|転職|社会人|大学生|キャリア|働きながら|shukatsu|tenshoku|hatarakinagara|daigakusei/i }
];

/* 初期段階では、内容を確認済みの入口記事だけを候補にする。 */
const CATALOG = [
  {id:'boki.html', label:'簿記', title:'日商簿記3級・2級の独学勉強法と合格スケジュール', topics:['accounting'], note:'簿記をゼロから進める全体像'},
  {id:'boki2.html', label:'簿記2級', title:'簿記2級の勉強時間・独学合格ロードマップ', topics:['accounting'], note:'次の試験までの学習順を決める'},
  {id:'boki2-next-exam.html', label:'簿記2級', title:'簿記2級の試験日程と最速3ヶ月合格ロードマップ', topics:['accounting','continuity'], note:'受験日から逆算して計画を作る'},
  {id:'boki-careless-miss.html', label:'簿記3級・2級', title:'電卓の打ち間違い・桁ミスをなくす「ミス記録ノート」の作り方', topics:['accounting','continuity'], note:'失点を次の改善へ変える'},
  {id:'takken.html', label:'宅建', title:'宅建士の独学合格ガイド・スケジュール', topics:['legal'], note:'宅建の学習全体をつかむ'},
  {id:'gyosei.html', label:'行政書士', title:'行政書士試験の独学合格ガイド', topics:['legal'], note:'行政書士を目指す前の全体設計'},
  {id:'takken-vs-gyosei.html', label:'資格比較', title:'宅建 vs 行政書士 どっちを先に取るべき？', topics:['legal','career'], note:'働き方から資格を選び直す'},
  {id:'shihoshoshi.html', label:'司法書士', title:'司法書士の独学合格ガイド', topics:['legal'], note:'長期学習の現実的な組み方'},
  {id:'sharoshi.html', label:'社労士', title:'社会保険労務士の独学合格ガイド', topics:['legal','career'], note:'労務・人事に活かす資格を考える'},
  {id:'takken-vs-mansion.html', label:'資格比較', title:'宅建 vs マンション管理士 どっちを先に取るべき？', topics:['legal','career'], note:'不動産資格の次の一手を比べる'},
  {id:'itp.html', label:'ITパスポート', title:'ITパスポートの独学合格ガイド', topics:['it'], note:'IT資格の最初の一歩を決める'},
  {id:'fe.html', label:'基本情報', title:'基本情報技術者試験の独学合格ガイド', topics:['it'], note:'ITパスポートの次を見極める'},
  {id:'ap.html', label:'応用情報', title:'応用情報技術者試験の完全ガイド', topics:['it'], note:'午後試験まで含めた攻略を組み立てる'},
  {id:'itp-vs-fe.html', label:'資格比較', title:'ITパスポート vs 基本情報 どっちを先に取るべき？', topics:['it','career'], note:'今の経験に合うレベルを選ぶ'},
  {id:'fe-vs-ap.html', label:'資格比較', title:'基本情報 vs 応用情報 どっちを先に取るべき？', topics:['it','career'], note:'次に進むIT資格を見極める'},
  {id:'mos.html', label:'MOS', title:'MOS（Microsoft Office Specialist）の独学合格ガイド', topics:['it','career'], note:'仕事で使うOfficeスキルを固める'},
  {id:'denki.html', label:'電気工事士', title:'電気工事士2種の独学合格ガイド', topics:['it','career'], note:'技術系資格の別ルートを比べる'},
  {id:'toeic.html', label:'TOEIC', title:'TOEIC L&Rの独学スコアアップ戦略', topics:['english'], note:'目標スコアから学習を逆算する'},
  {id:'eiken.html', label:'英検2級', title:'英検2級の独学合格ガイド', topics:['english'], note:'英検の対策順をつかむ'},
  {id:'toeic-vs-eiken.html', label:'資格比較', title:'TOEIC vs 英検 どっちを取るべき？', topics:['english','career'], note:'目的に合う英語資格を選ぶ'},
  {id:'eiken1.html', label:'英検準1級', title:'英検準1級の独学合格ガイド', topics:['english'], note:'英検2級の次の目標を考える'},
  {id:'toefl.html', label:'TOEFL', title:'TOEFL iBTの独学スコアアップ戦略', topics:['english','career'], note:'留学・海外進学向けの英語資格を比べる'},
  {id:'ielts.html', label:'IELTS', title:'IELTSの独学スコアアップ戦略', topics:['english','career'], note:'海外進学・移住に向けた英語資格を比べる'},
  {id:'fp.html', label:'FP2級', title:'FP2級・3級の独学合格ガイド', topics:['finance'], note:'FP学習の入口を整理する'},
  {id:'fp3.html', label:'FP3級', title:'FP3級の勉強時間・独学合格スケジュール', topics:['finance','continuity'], note:'短期で進める学習計画を作る'},
  {id:'fp3-lifeplanning.html', label:'FP3級', title:'ライフプランニングと資金計画', topics:['finance'], note:'生活に近いFP分野から理解する'},
  {id:'fp3-realestate.html', label:'FP3級', title:'不動産', topics:['finance','legal'], note:'FPの不動産分野を整理する'},
  {id:'fp3-tax.html', label:'FP3級', title:'税金', topics:['finance'], note:'税金分野を生活の判断につなげる'},
  {id:'keizoku.html', label:'勉強継続', title:'資格勉強が続かない原因と解決策7つ', topics:['continuity'], note:'止まりやすい原因から立て直す'},
  {id:'shikaku-zasetsu-riyu.html', label:'挫折・再開', title:'資格勉強を途中でやめる人のよくある理由｜立て直し方', topics:['continuity'], note:'一度止まった後の戻り方を考える'},
  {id:'shakaijin-benkyou-jikan.html', label:'勉強時間', title:'社会人が勉強時間を確保する方法7選', topics:['continuity','career'], note:'生活の中に勉強時間を作る'},
  {id:'boki-zasetsu-type.html', label:'簿記3級・2級', title:'勉強が続かない挫折する人の4タイプ診断', topics:['accounting','continuity'], note:'自分に合う立て直し方を見つける'},
  {id:'hatarakinagara-shikaku.html', label:'社会人向け', title:'働きながら取れる資格ランキング10選', topics:['career','continuity'], note:'仕事と両立しやすい選択肢を探す'},
  {id:'shukatsu-shikaku.html', label:'大学生向け', title:'就活で強い資格ランキング10選', topics:['career'], note:'就活に結び付く資格を整理する'},
  {id:'osusume-shikaku.html', label:'まとめ', title:'社会人におすすめの資格ランキング2026', topics:['career'], note:'目的別に候補を比べる'},
  {id:'shikaku-20dai.html', label:'まとめ', title:'20代におすすめの資格ランキング2026', topics:['career'], note:'20代のキャリアに合う資格を選ぶ'}
];

const FALLBACK_IDS = ['boki2.html', 'takken.html', 'itp.html', 'keizoku.html', 'toeic.html', 'fp3.html'];

function inferTopics(text){
  const source = String(text || '');
  const hits = TOPICS.filter(topic => topic.pattern.test(source)).map(topic => topic.id);
  return hits.length ? hits : ['continuity'];
}

function getCatalogEntry(id){
  return CATALOG.find(article => article.id === id);
}

function readState(){
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const state = raw ? JSON.parse(raw) : null;
    if(state && Array.isArray(state.history)) return state;
  } catch {}
  return {history:[], completed:[]};
}

function saveState(state){
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

function addSignal(state, id, title, topics, type){
  if(!id || id === 'search.html') return state;
  const now = Date.now();
  const previous = state.history.find(entry => entry.id === id);
  if(previous && type === 'view' && now - previous.at < 30 * 60 * 1000) return state;

  const entry = {
    id,
    title: title || previous?.title || '',
    topics: Array.isArray(topics) && topics.length ? topics : inferTopics(`${id} ${title || ''}`),
    type,
    at: now
  };
  state.history = [entry, ...state.history.filter(item => item.id !== id)].slice(0, MAX_HISTORY);
  return state;
}

function importReadMarks(state){
  try {
    const done = Object.keys(localStorage)
      .filter(key => key.startsWith('sq_read_'))
      .map(key => key.replace('sq_read_', ''));
    state.completed = Array.isArray(state.completed) ? state.completed : [];
    done.filter(id => !state.completed.includes(id)).forEach(id => {
      const article = getCatalogEntry(id);
      addSignal(state, id, article?.title || '', article?.topics || inferTopics(id), 'completed');
      state.completed.push(id);
    });
  } catch {}
  return state;
}

function topicWeights(history){
  const weights = {};
  history.forEach((entry, index) => {
    const freshness = Math.max(1, 7 - Math.min(index, 6));
    const strength = entry.type === 'completed' ? 3 : entry.type === 'reaction' ? 4 : 1;
    (entry.topics || []).forEach(topic => { weights[topic] = (weights[topic] || 0) + freshness * strength; });
  });
  return weights;
}

function recommendationReason(article, weights, hasHistory){
  const bestTopic = article.topics
    .map(topic => ({topic, score:weights[topic] || 0}))
    .sort((a,b) => b.score - a.score)[0];
  const label = TOPICS.find(topic => topic.id === bestTopic?.topic)?.label;
  if(hasHistory && bestTopic?.score) return `最近読んだ「${label}」に近い記事`;
  return article.note;
}

function selectRecommendations(state){
  const weights = topicWeights(state.history);
  const historyIds = new Set(state.history.map(entry => entry.id));
  const hasHistory = state.history.length > 1;
  const candidates = CATALOG
    .filter(article => article.id !== PAGE)
    .map(article => {
      const topicScore = article.topics.reduce((sum, topic) => sum + (weights[topic] || 0), 0);
      const seenPenalty = historyIds.has(article.id) ? 1000 : 0;
      const fallbackOrder = FALLBACK_IDS.indexOf(article.id);
      return {article, score:topicScore - seenPenalty - (fallbackOrder < 0 ? 0 : fallbackOrder / 100)};
    })
    .sort((a,b) => b.score - a.score);

  const selected = candidates.slice(0, 3).map(item => ({
    ...item.article,
    reason: recommendationReason(item.article, weights, hasHistory)
  }));
  return {selected, weights, hasHistory};
}

function esc(value){
  return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function render(state){
  if(document.querySelector('.sq-for-you') || !document.querySelector('footer')) return;
  const {selected, weights, hasHistory} = selectRecommendations(state);
  if(!selected.length) return;
  const activeTopics = Object.entries(weights)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => TOPICS.find(topic => topic.id === id)?.label)
    .filter(Boolean);

  const section = document.createElement('section');
  section.className = 'sq-for-you';
  section.setAttribute('aria-labelledby', 'sq-for-you-title');
  section.innerHTML = `
    <div class="sq-for-you__inner">
      <div class="sq-for-you__heading">
        <div>
          <div class="sq-for-you__eyebrow">FOR YOU</div>
          <h2 id="sq-for-you-title">あなたにおすすめの記事</h2>
          <p>${hasHistory && activeTopics.length ? `最近読んだ「${activeTopics.join('・')}」をもとに選びました。` : '読んだ記事が増えるほど、この端末でのおすすめがあなた向けに変わります。'}</p>
        </div>
        <button type="button" class="sq-for-you__reset">履歴を消去</button>
      </div>
      <div class="sq-for-you__grid">
        ${selected.map(article => `
          <a class="sq-for-you__card" href="${esc(article.id)}" data-recommendation-id="${esc(article.id)}">
            <img src="images/article-diagrams/${esc(article.id.replace(/\.html$/, ''))}.svg" data-sq-thumb-fallback="images/article-thumbnails/${esc(article.id.replace(/\.html$/, ''))}.jpg" alt="" width="640" height="360" loading="lazy" decoding="async">
            <span class="sq-for-you__body">
              <span class="sq-for-you__label">${esc(article.label)}</span>
              <span class="sq-for-you__title">${esc(article.title)}</span>
              <span class="sq-for-you__reason">${esc(article.reason)}</span>
            </span>
          </a>
        `).join('')}
      </div>
      <p class="sq-for-you__privacy">このおすすめは、この端末に保存した閲覧・読了・リアクションの傾向だけを使います。外部には送信しません。</p>
    </div>
  `;

  const widget = document.querySelector('.sq-widget');
  const footer = document.querySelector('footer');
  if(widget) widget.insertAdjacentElement('beforebegin', section);
  else footer.insertAdjacentElement('beforebegin', section);

  section.querySelectorAll('[data-sq-thumb-fallback]').forEach(image => {
    image.addEventListener('error', () => {
      const fallback = image.dataset.sqThumbFallback;
      if(!fallback || image.dataset.sqThumbFallbackApplied) return;
      image.dataset.sqThumbFallbackApplied = 'true';
      image.src = fallback;
    });
  });

  section.querySelector('.sq-for-you__reset').addEventListener('click', () => {
    try { localStorage.removeItem(STORE_KEY); } catch {}
    section.remove();
    render({history:[], completed:[]});
  });

  section.querySelectorAll('[data-recommendation-id]').forEach(link => {
    link.addEventListener('click', () => {
      const article = getCatalogEntry(link.dataset.recommendationId);
      const next = readState();
      addSignal(next, article?.id, article?.title, article?.topics, 'recommendation');
      saveState(next);
      try { window.gtag?.('event', 'personalized_recommendation_click', {from:PAGE, to:article?.id || '', source:'local_profile'}); } catch {}
    });
  });
}

function recordReaction(){
  document.addEventListener('click', event => {
    const button = event.target.closest('.sq-reaction-btn');
    if(!button) return;
    window.setTimeout(() => {
      if(!button.classList.contains('sq-reacted')) return;
      const state = readState();
      const title = document.querySelector('h1')?.textContent?.trim() || '';
      addSignal(state, PAGE, title, inferTopics(`${PAGE} ${title}`), 'reaction');
      saveState(state);
    }, 900);
  });
}

function waitForWidget(state, attempt){
  if(document.querySelector('.sq-widget') || attempt >= 12){
    render(state);
    return;
  }
  window.setTimeout(() => waitForWidget(state, attempt + 1), 150);
}

function injectStyles(){
  if(document.getElementById('sq-for-you-styles')) return;
  const style = document.createElement('style');
  style.id = 'sq-for-you-styles';
  style.textContent = `
    .sq-for-you{padding:44px 24px;background:linear-gradient(135deg,color-mix(in srgb,var(--sq-surface-soft) 92%,#dff2c4 8%),var(--sq-surface-strong));border-top:1px solid var(--sq-border);}
    .sq-for-you__inner{max-width:800px;margin:0 auto;}
    .sq-for-you__heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:18px;}
    .sq-for-you__eyebrow{margin:0 0 5px;color:var(--sq-accent-bright);font-size:10px;font-weight:800;letter-spacing:.16em;}
    .sq-for-you h2{margin:0;color:var(--sq-text);font-size:20px;letter-spacing:.02em;}
    .sq-for-you__heading p{margin:7px 0 0;color:var(--sq-soft);font-size:12px;line-height:1.7;}
    .sq-for-you__reset{appearance:none;border:1px solid var(--sq-border);border-radius:999px;padding:7px 10px;background:transparent;color:var(--sq-muted);font:inherit;font-size:11px;cursor:pointer;white-space:nowrap;}
    .sq-for-you__reset:hover{border-color:var(--sq-accent);color:var(--sq-accent-bright);}
    .sq-for-you__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
    .sq-for-you__card{display:block;overflow:hidden;border:1px solid var(--sq-border-strong);border-radius:12px;background:linear-gradient(180deg,var(--sq-surface),var(--sq-surface-strong));box-shadow:var(--sq-shadow);color:inherit;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;}
    .sq-for-you__card:hover{transform:translateY(-2px);border-color:var(--sq-accent);box-shadow:var(--sq-shadow-strong);text-decoration:none;}
    .sq-for-you__card img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;background:var(--sq-surface-strong);}
    .sq-for-you__body{display:block;padding:12px 13px 13px;}
    .sq-for-you__label{display:block;margin-bottom:5px;color:var(--sq-accent-bright);font-size:10px;font-weight:800;letter-spacing:.07em;}
    .sq-for-you__title{display:block;color:var(--sq-text);font-size:13px;font-weight:700;line-height:1.55;}
    .sq-for-you__reason{display:block;margin-top:7px;color:var(--sq-muted);font-size:11px;line-height:1.55;}
    .sq-for-you__privacy{margin:13px 0 0;color:var(--sq-muted);font-size:10px;line-height:1.7;}
    @media(max-width:600px){
      .sq-for-you{padding:32px 16px;}
      .sq-for-you__heading{align-items:flex-start;gap:10px;}
      .sq-for-you h2{font-size:18px;}
      .sq-for-you__grid{grid-template-columns:1fr;gap:9px;}
      .sq-for-you__card{display:grid;grid-template-columns:122px minmax(0,1fr);align-items:stretch;}
      .sq-for-you__card img{width:122px;height:100%;min-height:72px;aspect-ratio:auto;object-fit:cover;}
      .sq-for-you__body{padding:10px 11px;}
      .sq-for-you__title{font-size:12px;line-height:1.5;}
      .sq-for-you__reason{margin-top:4px;font-size:10px;}
    }
    @media(prefers-reduced-motion:reduce){.sq-for-you__card{transition:none;}.sq-for-you__card:hover{transform:none;}}
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
  if(!PAGE || PAGE === 'search.html') return;
  const state = importReadMarks(readState());
  const title = document.querySelector('h1')?.textContent?.trim() || '';
  addSignal(state, PAGE, title, inferTopics(`${PAGE} ${title}`), 'view');
  saveState(state);
  injectStyles();
  recordReaction();
  waitForWidget(state, 0);
});
})();
