/* Uses the existing admin session. The server rechecks both Auth and is_admin. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const config = window.SQ_FORUM_CONFIG || {};
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const reasons = { personal: '個人情報', abuse: '攻撃的な内容・迷惑投稿', copyright: '転載・権利', other: 'その他' };
  let busy = false;
  function visitor() {
    try { let id = localStorage.getItem('sq_forum_visitor'); if (!/^[0-9a-f-]{36}$/i.test(id || '')) { id = crypto.randomUUID(); localStorage.setItem('sq_forum_visitor', id); } return id; }
    catch { return crypto.randomUUID(); }
  }
  async function api(action, payload = {}) {
    if (!config.enabled) throw new Error('掲示板の本番受付はまだ有効になっていません。');
    const token = await getToken();
    const response = await fetch(config.endpoint, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json', apikey: config.publicKey, Authorization: `Bearer ${token}` }, body: JSON.stringify({ action, payload, visitor_id: visitor() }), signal: AbortSignal.timeout(15000) });
    const data = await response.json(); if (!response.ok || data.error) throw new Error(data.error || '操作を確認できませんでした。'); return data;
  }
  function confirmAction(label) {
    return new Promise(resolve => {
      const dialog = el('dialog', undefined, 'forum-admin-confirm');
      const heading = el('h2', '操作の確認'); heading.id = 'forum-admin-confirm-title';
      dialog.setAttribute('aria-labelledby', heading.id);
      dialog.append(heading, el('p', `「${label}」を実行します。よろしいですか？`));
      const actions = el('div', undefined, 'forum-review-actions');
      const cancel = el('button', '戻る'); const proceed = el('button', label);
      const settle = value => { dialog.close(); dialog.remove(); resolve(value); };
      cancel.addEventListener('click', () => settle(false), { once: true });
      proceed.addEventListener('click', () => settle(true), { once: true });
      dialog.addEventListener('cancel', event => { event.preventDefault(); settle(false); }, { once: true });
      actions.append(cancel, proceed); dialog.append(actions); document.body.append(dialog); dialog.showModal();
    });
  }
  async function moderate(payload, label) {
    if (busy) return;
    busy = true;
    if (!await confirmAction(label)) { busy = false; return; }
    document.querySelectorAll('.forum-moderation button').forEach(b => { b.disabled = true; });
    try { await api('moderate', payload); await loadForumModeration(); }
    catch (error) { $('forum-admin-status').textContent = `結果を確認できませんでした。自動で再実行せず、一覧を更新してください。${error.message}`; }
    finally { busy = false; document.querySelectorAll('.forum-moderation button').forEach(b => { b.disabled = false; }); }
  }
  function action(label, payload) { const b = el('button', label); b.type = 'button'; b.addEventListener('click', () => moderate(payload, label)); return b; }
  window.loadForumModeration = async function loadForumModeration() {
    $('forum-admin-status').textContent = '読み込んでいます…';
    try {
      const data = await api('admin_queue');
      if (!Array.isArray(data.pending) || !Array.isArray(data.reports)) throw new Error('一覧の形式を確認できませんでした。');
      $('forum-pending-count').textContent = `（全${data.pending_count}件・先頭20件）`;
      $('forum-pending').replaceChildren(); $('forum-reports').replaceChildren();
      if (!data.pending.length) $('forum-pending').append(el('p', '確認待ちの投稿はありません。'));
      for (const p of data.pending) {
        const card = el('article', undefined, 'forum-review-card');
        card.append(el('h4', p.title), el('p', `${p.name} · ${p.reply_to ? `#${p.reply_to} への返信` : p.thread_status === 'pending' ? '新しいスレッドの最初の投稿' : 'スレッドへの投稿'} · ${p.post_count}/1,000件`), el('p', p.body, 'forum-review-body'));
        const actions = el('div', undefined, 'forum-review-actions');
        if (p.post_count < 1000 && p.thread_status !== 'hidden') actions.append(action('公開する', { decision: 'approve', post_id: p.id }));
        actions.append(action('公開せずに保留を終了する', { decision: 'reject', post_id: p.id })); card.append(actions); $('forum-pending').append(card);
      }
      if (!data.reports.length) $('forum-reports').append(el('p', '未対応の連絡はありません。'));
      for (const r of data.reports) {
        const card = el('article', undefined, 'forum-review-card');
        card.append(el('h4', `${r.title} / #${r.seq}`), el('p', `理由：${reasons[r.reason] || 'その他'}`), el('p', r.body, 'forum-review-body'));
        const actions = el('div', undefined, 'forum-review-actions');
        if (r.status === 'published') actions.append(action('この投稿を非表示にする', { decision: 'hide', post_id: r.post_id }));
        actions.append(action('スレッド全体を非表示にする', { decision: 'hide_thread', thread_id: r.thread_id }), action('対応済みにする', { decision: 'dismiss_report', report_id: r.id }));
        card.append(actions); $('forum-reports').append(card);
      }
      $('forum-admin-status').textContent = 'サーバーで管理者権限を確認し、一覧を取得しました。';
    } catch (error) { $('forum-admin-status').textContent = error.message; }
  };
})();
