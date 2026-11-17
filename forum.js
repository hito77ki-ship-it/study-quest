(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const config = window.SQ_FORUM_CONFIG || {};
  const categories = { boki: '簿記', it: 'IT・情報処理', general: '資格・勉強全般' };
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const params = new URLSearchParams(location.search);
  const threadId = params.get('thread');
  const initialAfter = Math.min(980, Math.max(0, Math.floor((Number(params.get('after')) || 0) / 20) * 20));
  let currentThread = null, after = initialAfter, cursor = null, listEpoch = 0;
  let replyTo = null, previousId = null, reportedPost = null;
  let replyRequest = null, threadRequest = null, reportRequest = null;
  const seen = new Set();
  const date = value => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };
  const node = (tag, text, cls) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  };
  const threadUrl = (id, seq = 1) => `forum.html?thread=${encodeURIComponent(id)}${seq > 20 ? `&after=${Math.floor((seq - 1) / 20) * 20}` : ''}${seq > 1 ? `#post-${seq}` : ''}`;
  const requestId = () => crypto.randomUUID();
  function visitorId() {
    try {
      const v = localStorage.getItem('sq_forum_visitor');
      if (v && uuid.test(v)) return v;
      const value = requestId(); localStorage.setItem('sq_forum_visitor', value); return value;
    } catch { return visitorId.fallback ||= requestId(); }
  }
  async function api(action, payload = {}) {
    if (!config.enabled) throw new Error('掲示板は準備中です。お問い合わせは専用フォームからお送りください。');
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 15000);
    const headers = { 'Content-Type': 'application/json' };
    if (config.publicKey) { headers.apikey = config.publicKey; headers.Authorization = `Bearer ${config.publicKey}`; }
    try {
      const response = await fetch(config.endpoint, { method: 'POST', headers, body: JSON.stringify({ action, payload, visitor_id: visitorId() }), signal: ctl.signal, credentials: 'omit' });
      let data;
      try { data = await response.json(); } catch { throw new Error('受付の結果を読み取れませんでした。入力を残したまま、時間をおいて再確認してください。'); }
      if (!response.ok || data.error) throw new Error(data.error || '読み込みに失敗しました。時間をおいて再度お試しください。');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('通信の結果を確認できませんでした。同じ内容で再送すると、受付番号を照合します。');
      if (error instanceof TypeError) throw new Error('通信できませんでした。接続を確認して再度お試しください。');
      throw error;
    } finally { clearTimeout(timer); }
  }
  function message(text) { $('api-status').textContent = text; $('api-status').hidden = !text; }
  function view(name) {
    for (const id of ['thread-list-view', 'thread-view', 'compose-view']) $(id).hidden = id !== name;
    message('');
  }
  function articleUrl(value) {
    if (!value) return '';
    let u;
    try { u = new URL(value); } catch { throw new Error('関連する記事URLを確認してください。'); }
    if (u.origin !== 'https://study-quest.net' || !/^\/[a-z0-9-]+\.html$/.test(u.pathname) || u.username || u.password || u.search) throw new Error('関連する記事には、Study Questの記事URLを入力してください。');
    return u.origin + u.pathname;
  }
  function bodyValue(id) {
    const text = $(id).value.trim();
    if (!text || [...text].length > 1000) throw new Error('本文は1〜1,000文字で入力してください。');
    return text;
  }
  function nameValue(id) {
    const text = $(id).value.trim();
    if ([...text].length > 20) throw new Error('名前は20文字以内で入力してください。');
    return text || '名無しさん';
  }
  function makeRequest(previous, payload) {
    const fingerprint = JSON.stringify(payload);
    return previous?.fingerprint === fingerprint ? previous : { id: requestId(), fingerprint };
  }
  async function loadThreads(reset = false) {
    const epoch = ++listEpoch;
    if (reset) { cursor = null; $('threads').replaceChildren(); }
    $('more-threads').disabled = true;
    message('読み込んでいます…');
    try {
      const data = await api('list', { category: $('category-filter').value, cursor });
      if (epoch !== listEpoch) return;
      if (!Array.isArray(data.threads)) throw new Error('スレッド一覧を確認できませんでした。');
      if (reset && !data.threads.length) $('threads').append(node('p', 'まだ公開されたスレッドはありません。最初の質問を投稿してみませんか。', 'notice'));
      for (const t of data.threads) {
        const row = node('article', undefined, 'thread-row');
        const main = node('div');
        main.append(node('span', categories[t.category] || '資格・勉強全般', 'tag'));
        const h = node('h3'); const link = node('a', t.title); link.href = threadUrl(t.id); h.append(link); main.append(h);
        main.append(node('p', `${date(t.created_at)}（日本時間）${t.closed ? ' · 受付終了' : ''}`, 'muted'));
        const count = node('div', `${t.post_count} / 1,000`, 'count'); count.append(node('small', '公開・非表示を含む投稿番号'));
        row.append(main, count); $('threads').append(row);
      }
      cursor = data.next_cursor || null;
      $('more-threads').hidden = !data.has_more; message('');
    } catch (error) { if (epoch === listEpoch) message(error.message); }
    finally { if (epoch === listEpoch) $('more-threads').disabled = false; }
  }
  function renderPost(post) {
    if (seen.has(post.seq)) return;
    seen.add(post.seq);
    const card = node('article', undefined, 'post'); card.id = `post-${post.seq}`;
    const h = node('div', undefined, 'post-header');
    const permalink = node('a', `#${post.seq}`, 'post-number'); permalink.href = threadUrl(currentThread.id, post.seq);
    h.append(permalink, node('strong', post.hidden ? '非表示' : post.name), node('time', `${date(post.created_at)}（日本時間）`));
    card.append(h);
    if (post.reply_to) { const a = node('a', `>>${post.reply_to} への返信`); a.href = threadUrl(currentThread.id, post.reply_to); card.append(a); }
    card.append(node('p', post.hidden ? 'この投稿は運営が非表示にしています。投稿番号はそのまま残しています。' : post.body, 'post-body'));
    if (!post.hidden) {
      const actions = node('div', undefined, 'post-actions');
      if (!currentThread.closed) {
        const reply = node('button', `#${post.seq} に返信`); reply.type = 'button';
        reply.addEventListener('click', () => {
          replyTo = post.seq; $('reply-context').textContent = `#${post.seq} への返信`; $('reply-context').hidden = false; $('cancel-reply').hidden = false;
          $('reply-body').focus(); $('reply-heading').scrollIntoView({ block: 'start' });
        }); actions.append(reply);
      }
      const report = node('button', '運営に知らせる'); report.type = 'button';
      report.addEventListener('click', () => { reportedPost = post.seq; reportRequest = null; $('report-status').textContent = ''; $('report-form').querySelector('button[type=submit]').disabled = false; $('report-dialog').showModal(); });
      actions.append(report); card.append(actions);
    }
    $('posts').append(card);
  }
  async function loadThread() {
    $('more-posts').disabled = true; message('読み込んでいます…');
    try {
      const data = await api('thread', { thread_id: threadId, after });
      if (!data.thread || !Array.isArray(data.posts)) throw new Error('スレッドを確認できませんでした。');
      currentThread = data.thread;
      $('thread-title').textContent = currentThread.title;
      document.title = `${currentThread.title}｜Study Quest 学習掲示板`;
      $('thread-category').textContent = categories[currentThread.category] || '';
      $('thread-summary').textContent = `${currentThread.post_count} / 1,000件 · 投稿日時は日本時間`;
      $('closed-notice').hidden = !currentThread.closed;
      $('reply-form').hidden = currentThread.closed;
      $('next-thread').hidden = !currentThread.next_thread_id;
      if (currentThread.next_thread_id) $('next-thread').href = threadUrl(currentThread.next_thread_id);
      $('create-continuation').hidden = !currentThread.closed || Boolean(currentThread.next_thread_id) || currentThread.continuation_pending;
      if (currentThread.continuation_pending && !currentThread.next_thread_id) message('続きのスレッドは確認待ちです。公開後にリンクを表示します。'); else message('');
      $('previous-thread').hidden = !currentThread.previous_thread_id;
      if (currentThread.previous_thread_id) $('previous-thread').href = threadUrl(currentThread.previous_thread_id);
      $('article-link').hidden = !currentThread.article_url;
      if (currentThread.article_url) $('article-link').href = articleUrl(currentThread.article_url);
      $('first-posts').hidden = initialAfter === 0; $('first-posts').href = threadUrl(currentThread.id);
      for (const post of data.posts) renderPost(post);
      after = data.next_after;
      $('more-posts').hidden = !data.has_more;
      $('end-of-posts').hidden = data.has_more;
      if (location.hash && seen.size <= 20) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
    } catch (error) { message(error.message); }
    finally { $('more-posts').disabled = false; }
  }
  function compose(previous = null) {
    previousId = previous?.id || null;
    view('compose-view'); $('continuation-context').hidden = !previous;
    if (previous) {
      $('continuation-context').textContent = `「${previous.title}」の続きのスレッドです。運営が最初の投稿を確認してから、前のスレッドにリンクを付けます。`;
      $('thread-title-input').value = `${previous.title.slice(0, 70)}（続き）`;
      $('thread-category-input').value = previous.category; $('thread-article').value = previous.article_url || '';
    }
    $('compose-heading').focus(); $('compose-heading').scrollIntoView({ block: 'start' });
  }
  function cancelReply() { replyTo = null; $('reply-context').hidden = true; $('cancel-reply').hidden = true; }
  $('thread-form').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.target.querySelector('button[type=submit]'); button.disabled = true;
    try {
      const title = $('thread-title-input').value.trim();
      if (!title || [...title].length > 80) throw new Error('タイトルは1〜80文字で入力してください。');
      const payload = { title, category: $('thread-category-input').value, article_url: articleUrl($('thread-article').value.trim()), name: nameValue('thread-name'), body: bodyValue('thread-body'), previous_thread_id: previousId };
      threadRequest = makeRequest(threadRequest, payload);
      const result = await api('create', { ...payload, request_id: threadRequest.id, consent: $('thread-consent').checked });
      if (!['pending','published','hidden','rejected'].includes(result.status) || !result.receipt) throw new Error('受付の結果を確認できませんでした。');
      $('thread-status').textContent = result.status === 'pending' ? `確認待ちとして受け付けました。まだ公開されていません。受付番号：${result.receipt}` : `この投稿はすでに受付済みです。公開状況はスレッド上で確認してください。受付番号：${result.receipt}`;
      event.target.reset(); threadRequest = null;
    } catch (error) { $('thread-status').textContent = error.message; }
    finally { button.disabled = false; }
  });
  $('reply-form').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.target.querySelector('button[type=submit]'); button.disabled = true;
    try {
      const payload = { thread_id: threadId, reply_to: replyTo, name: nameValue('reply-name'), body: bodyValue('reply-body') };
      replyRequest = makeRequest(replyRequest, payload);
      const result = await api('reply', { ...payload, request_id: replyRequest.id, consent: $('reply-consent').checked });
      if (!['pending','published','hidden','rejected'].includes(result.status) || !result.receipt) throw new Error('受付の結果を確認できませんでした。');
      $('reply-status').textContent = result.status === 'pending' ? `確認待ちとして受け付けました。まだ公開されていません。受付番号：${result.receipt}` : `この投稿はすでに受付済みです。公開状況はスレッド上で確認してください。受付番号：${result.receipt}`;
      event.target.reset(); cancelReply(); replyRequest = null;
    } catch (error) { $('reply-status').textContent = error.message; }
    finally { button.disabled = false; }
  });
  $('report-form').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.target.querySelector('button[type=submit]'); button.disabled = true;
    try {
      const payload = { thread_id: threadId, seq: reportedPost, reason: $('report-reason').value };
      reportRequest = makeRequest(reportRequest, payload);
      const result = await api('report', { ...payload, request_id: reportRequest.id });
      if (result.status !== 'received') throw new Error('通報の受付結果を確認できませんでした。');
      $('report-status').textContent = '運営への連絡を受け付けました。確認後に対応します。';
    } catch (error) { $('report-status').textContent = error.message; button.disabled = false; }
  });
  $('cancel-report').addEventListener('click', () => $('report-dialog').close());
  $('new-thread').addEventListener('click', () => compose());
  $('create-continuation').addEventListener('click', () => compose(currentThread));
  $('cancel-compose').addEventListener('click', () => {
    view(threadId ? 'thread-view' : 'thread-list-view');
    if (threadId) { after = initialAfter; seen.clear(); $('posts').replaceChildren(); loadThread(); }
    (threadId ? $('thread-title') : $('list-heading')).focus();
  });
  $('cancel-reply').addEventListener('click', cancelReply);
  $('category-filter').addEventListener('change', () => loadThreads(true));
  $('more-threads').addEventListener('click', () => loadThreads());
  $('more-posts').addEventListener('click', () => loadThread());
  function setTheme(value) {
    document.documentElement.dataset.theme = value;
    $('theme-toggle').textContent = value === 'dark' ? '明るい表示' : '暗い表示';
    $('theme-toggle').setAttribute('aria-label', `${value === 'dark' ? '明るい' : '暗い'}表示に切り替える`);
    try { localStorage.setItem('sq_forum_theme', value); } catch { /* The theme still works without storage. */ }
  }
  let savedTheme; try { savedTheme = localStorage.getItem('sq_forum_theme'); } catch { /* Optional setting. */ }
  setTheme(savedTheme === 'light' ? 'light' : 'dark');
  $('theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  if (!config.enabled) {
    message('掲示板は準備中です。公開まで、お問い合わせは専用フォームからお送りください。');
    for (const form of document.forms) for (const el of form.elements) el.disabled = true;
    $('new-thread').disabled = true; $('category-filter').disabled = true;
  } else if (threadId && uuid.test(threadId)) { view('thread-view'); loadThread(); }
  else if (threadId) { message('スレッドのURLを確認してください。'); }
  else { loadThreads(true); }
})();
