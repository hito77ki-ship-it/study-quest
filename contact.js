(function () {
  'use strict';
  const form = document.getElementById('contactForm');
  const message = document.getElementById('f_message');
  const payload = document.getElementById('f_payload');
  const backendType = document.getElementById('f_backend_type');
  const button = document.getElementById('submitBtn');
  const kinds = {
    correction: {label: '記事の誤り・古い情報', backend: 'その他'},
    explanation: {label: '図解・説明の追加', backend: 'その他'},
    bug: {label: 'バグ・不具合の報告', backend: 'バグ報告'},
    feature: {label: '機能のご要望', backend: '機能要望'},
    account: {label: 'アカウント・データについて', backend: 'アカウントについて'},
    other: {label: 'その他', backend: 'その他'}
  };
  const params = new URLSearchParams(location.search);
  let context = null;
  try {
    const article = new URL(params.get('article'));
    if (article.origin === 'https://study-quest.net' && !article.username && !article.password &&
        /^\/[a-z0-9][a-z0-9-]*\.html$/.test(article.pathname)) {
      article.search = '';
      article.hash = '';
      context = {
        url: article.href,
        title: (params.get('title') || article.pathname.slice(1)).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 300)
      };
    }
  } catch { /* Invalid or absent context does not prevent a general inquiry. */ }
  if (context) {
    document.body.classList.add('article-inquiry');
    document.getElementById('articleContext').hidden = false;
    document.getElementById('f_article_title').value = context.title;
    document.getElementById('f_article_url').value = context.url;
    const back = document.querySelector('.nav-back');
    back.href = context.url;
    back.textContent = '← 記事に戻る';
  }
  const selectedKind = params.get('kind');
  if (Object.hasOwn(kinds, selectedKind)) {
    form.querySelector(`input[name="inquiry_kind"][value="${selectedKind}"]`).checked = true;
  }
  function kind() {
    const selected = form.querySelector('input[name="inquiry_kind"]:checked');
    return kinds[selected?.value] || kinds.other;
  }
  function resetSubmission() {
    payload.disabled = true;
    message.name = 'entry.500624834';
    button.disabled = false;
    button.textContent = '送信して受付結果を確認する';
    backendType.value = kind().backend;
  }
  form.addEventListener('change', () => { backendType.value = kind().backend; });
  form.addEventListener('submit', () => {
    const lines = ['【お問い合わせ種別】' + kind().label];
    if (context) lines.push('【記事名】' + context.title, '【記事URL】' + context.url);
    lines.push('', '【お問い合わせ内容】', message.value.trim());
    payload.value = lines.join('\n');
    payload.disabled = false;
    message.removeAttribute('name');
    backendType.value = kind().backend;
    button.disabled = true;
    button.textContent = '受付結果の画面へ移動しています…';
    // Submit normally. Google Forms displays its actual acceptance or validation result.
    // An opaque no-cors response is deliberately not treated as a successful receipt.
  });
  window.addEventListener('pageshow', resetSubmission);
  resetSubmission();
})();
