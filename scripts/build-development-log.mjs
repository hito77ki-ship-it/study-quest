import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'development-log.json'), 'utf8'));
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const date = (value) => value.replaceAll('-', '.');
const ids = new Set();
if (!/^\d{4}-\d{2}-\d{2}$/.test(source.updated) || !source.entries.length) throw new Error('Missing dated diary entries');
for (const entry of source.entries) {
  if (!/^[a-z0-9-]+$/.test(entry.id) || ids.has(entry.id)) throw new Error('Duplicate or unsafe entry ID');
  ids.add(entry.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || entry.date > source.updated) throw new Error('Invalid entry date');
  for (const key of ['title','summary','category','status','context','before','after','owner_role','ai_role','limits','reflection','verified_date']) {
    if (typeof entry[key] !== 'string' || !entry[key].trim()) throw new Error(`Missing ${entry.id}.${key}`);
  }
  if (!entry.checks?.length || !entry.links?.length) throw new Error('Evidence and checks are required');
  for (const link of entry.links) {
    if (!/^(?:[a-z0-9-]+\.html(?:#[a-z0-9-]+)?|https:\/\/github\.com\/hito77ki-ship-it\/study-quest\/pull\/\d+)$/.test(link.url)) throw new Error('Unexpected public evidence URL');
  }
}
if (source.entries.some((entry, index) => index > 0 && source.entries[index - 1].date < entry.date)) throw new Error('Entries must be newest first');

const entries = source.entries.map((entry) => `<article class="log-entry" id="${escape(entry.id)}">
  <div class="entry-meta"><time datetime="${escape(entry.date)}">${date(entry.date)}</time><span>${escape(entry.category)}</span><span class="verified">${escape(entry.status)}</span></div>
  <h2>${escape(entry.title)}</h2><p class="entry-summary">${escape(entry.summary)}</p>
  <details><summary>経緯・確認結果を読む<span aria-hidden="true">＋</span></summary><div class="entry-body">
    <h3>きっかけ</h3><p>${escape(entry.context)}</p>
    <div class="comparison"><div><span class="small-label">BEFORE / 修正前</span><p>${escape(entry.before)}</p></div><div><span class="small-label">AFTER / 修正後</span><p>${escape(entry.after)}</p></div></div>
${entry.comparison ? `<figure class="record-example"><figcaption>${escape(entry.comparison.label)}</figcaption><div class="example-values"><span><small>修正前</small>${escape(entry.comparison.before)}</span><b aria-hidden="true">→</b><span><small>修正後</small>${escape(entry.comparison.after)}</span></div><p>${escape(entry.comparison.note)}</p></figure>` : ''}
    <h3>本人の依頼・運営方針</h3><p>${escape(entry.owner_role)}</p>
    <h3>AIが担当した作業</h3><p>${escape(entry.ai_role)}</p>
    <h3>確かめたこと</h3><ul>${entry.checks.map((check) => `<li>${escape(check)}</li>`).join('')}</ul>
    <p class="limits"><strong>確認の範囲</strong>${escape(entry.limits)}</p>
    <h3>振り返り</h3><p>${escape(entry.reflection)}</p>
    <p class="verification-date">上記の公開確認日：<time datetime="${escape(entry.verified_date)}">${date(entry.verified_date)}</time>。当日の検証記録をもとに記載しています。</p>
    <div class="evidence-links">${entry.links.map((link) => `<a href="${escape(link.url)}">${escape(link.label)}<span aria-hidden="true"> ↗</span></a>`).join('')}</div>
  </div></details>
</article>`).join('\n');

// 公開用の要点だけを生成する。私的な日誌CSV・分析データ・認証情報は読み込まない。
const output = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>開発・運営日誌｜改善の理由と確認結果｜Study Quest</title>
<meta name="description" content="Study Questで何に気づき、何を決め、どう改善・検証したかを残す開発・運営日誌。本人の依頼・運営方針とAIが担当した作業を分け、修正の根拠と確認の範囲を記録します。">
<link rel="canonical" href="https://study-quest.net/development-log.html"><link rel="icon" href="favicon.ico">
<meta property="og:type" content="website"><meta property="og:title" content="開発・運営日誌｜Study Quest"><meta property="og:description" content="気づく、決める、直す、確かめる。Study Questの改善の過程と、その根拠を残します。"><meta property="og:url" content="https://study-quest.net/development-log.html"><meta property="og:image" content="https://study-quest.net/images/study-quest-category-overview.jpg"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="development-log.css"><script defer src="development-log.js"></script>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:'Study Quest 開発・運営日誌',url:'https://study-quest.net/development-log.html',dateCreated:'2026-11-07',dateModified:source.updated,inLanguage:'ja',description:'改善の理由、役割分担、検証結果と根拠を残す公開日誌。'})}</script>
</head><body><a class="skip" href="#main">本文へ移動</a>
<header><a class="logo" href="index.html"><span aria-hidden="true">⚔</span> STUDY QUEST</a><nav aria-label="ページ上部"><a href="index.html#updates">更新情報</a><button id="diary-theme" type="button">テーマ：自動</button></nav></header>
<main id="main"><div class="hero"><p class="eyebrow">FIELD NOTES / SINCE 2026</p><h1>小さく直して、<br>理由まで残す。</h1><p class="lead">Study Quest 開発・運営日誌。<br>学習に使う人の目線から、何に気づき、どう判断し、どう確かめたかを記録します。</p><p class="updated">日誌公開：2026.11.07 ／ 一覧更新：<time datetime="${source.updated}">${date(source.updated)}</time></p></div>
<ol class="process" aria-label="改善を記録する流れ"><li><span>01</span>気づく</li><li><span>02</span>決める</li><li><span>03</span>直す</li><li><span>04</span>確かめる</li></ol>
<div class="layout"><aside><p class="eyebrow">記録を選ぶ</p><nav aria-label="日誌の目次"><ol>${source.entries.map((entry) => `<li><a href="#${escape(entry.id)}"><time datetime="${entry.date}">${date(entry.date)}</time>${escape(entry.title)}</a></li>`).join('')}</ol></nav><a class="about-link" href="#about-log">この日誌の書き方 ↓</a></aside><div class="entries">${entries}</div></div>
<section class="about" id="about-log"><p class="eyebrow">HOW WE KEEP NOTES</p><h2>作業の結果と、役割を分けて残します。</h2><p>このサイトは、運営者からの依頼・判断と、CodexなどのAIによる調査・実装支援を組み合わせて改善しています。この日誌も、作業記録と公開された差分をもとにAIが整理しています。本人がすべてを手作業で実装したという記録ではありません。</p><p>修正や公開があったときは、目的、変更内容、本人とAIの役割、確認結果、未確認の点、関連するページやPRを追記します。日付は日本時間。過去の改善は実施日を残し、日誌にまとめた日と区別します。変化のない定期点検は私的な運営日誌に記録します。</p><p>振り返りは記録から整理した内容です。本人の発言や感想を創作して引用しません。非公開の利用状況や個人情報は掲載しません。</p></section>
<section class="feedback"><p class="eyebrow">FEEDBACK</p><h2>使って気づいたことを、次の改善へ。</h2><p>説明しづらいところ、使いにくいところがあれば、日誌の日付・見出しと、困った場面を添えて教えてください。</p><a class="button" href="contact.html">お問い合わせから意見を送る <span aria-hidden="true">↗</span></a></section>
</main><footer><a href="index.html">Study Quest トップ</a><a href="app.html">学習記録アプリ</a><a href="about.html">運営者情報</a><a href="privacy.html">プライバシーポリシー</a><span>© 2026 Study Quest</span></footer></body></html>
`;
const destination = path.join(root, 'development-log.html');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(destination, 'utf8') !== output) throw new Error('development-log.html is out of sync; run node scripts/build-development-log.mjs');
  console.log(`PASS public diary: ${source.entries.length} dated entries, roles and evidence, generated HTML in sync`);
} else {
  fs.writeFileSync(destination, output);
  console.log(`Built development-log.html (${source.entries.length} entries)`);
}
