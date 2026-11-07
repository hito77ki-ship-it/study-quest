(function () {
  'use strict';

  function buildArticleFeedback() {
    if (document.getElementById('sq-article-feedback')) return;
    function isArticle(value) {
      if (Array.isArray(value)) return value.some(isArticle);
      if (!value || typeof value !== 'object') return false;
      const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
      return types.some(type => ['Article', 'BlogPosting', 'NewsArticle'].includes(type)) ||
        Object.values(value).some(isArticle);
    }
    const articlePage = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(script => {
      try { return isArticle(JSON.parse(script.textContent)); } catch { return false; }
    });
    if (!articlePage) return;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) return;
    let article;
    try { article = new URL(canonical.href); } catch { return; }
    if (article.origin !== 'https://study-quest.net' || article.username || article.password ||
        !/^\/[a-z0-9][a-z0-9-]*\.html$/.test(article.pathname)) return;
    article.search = '';
    article.hash = '';
    const title = (document.querySelector('h1')?.textContent || document.title)
      .replace(/\s+/g, ' ').trim().slice(0, 300);

    const section = document.createElement('section');
    section.id = 'sq-article-feedback';
    section.className = 'sq-article-feedback';
    section.setAttribute('aria-labelledby', 'sq-article-feedback-title');
    const inner = document.createElement('div');
    inner.className = 'sq-article-feedback-inner';
    const heading = document.createElement('h2');
    heading.id = 'sq-article-feedback-title';
    heading.textContent = 'この記事への気づきを教えてください';
    const description = document.createElement('p');
    description.textContent = '記事名とURLを添えて運営へ届きます。公開コメントには掲載されません。';
    const links = document.createElement('div');
    links.className = 'sq-article-feedback-links';
    for (const [kind, label] of [
      ['correction', '誤り・古い情報を報告する'],
      ['explanation', '図解・説明の追加をお願いする']
    ]) {
      const link = document.createElement('a');
      const target = new URL('contact.html', article);
      target.search = new URLSearchParams({kind, article: article.href, title}).toString();
      // On previews keep navigation within the preview; only public article metadata is passed.
      link.href = 'contact.html' + target.search;
      link.textContent = label;
      links.appendChild(link);
    }
    inner.append(heading, description, links);
    section.appendChild(inner);
    const footer = document.querySelector('footer') || document.querySelector('body > .footer');
    if (footer) footer.insertAdjacentElement('beforebegin', section);
    else document.body.appendChild(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildArticleFeedback, {once: true});
  } else buildArticleFeedback();
})();
