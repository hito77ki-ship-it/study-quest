#!/usr/bin/env node
/**
 * 記事カード用のメッセージ型SVGサムネイルを生成する。
 *
 * 画像内の日本語を画像生成AIに任せず、記事台帳からSVGとして描画する。
 * これにより、201件の題名と視覚メッセージを必ず一致させられる。
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'article-widgets.js');
const outputDir = path.join(root, 'images', 'article-diagrams');
const artDir = path.join(root, 'images', 'thumbnail-art-16x9');

const source = fs.readFileSync(sourcePath, 'utf8');
const match = source.match(/const ARTICLES = (\{[\s\S]*?\n\});\n\n\/\*/);
if (!match) throw new Error('ARTICLES台帳を article-widgets.js から読み取れません。');
const ARTICLES = vm.runInNewContext(`(${match[1]})`);

const THEMES = {
  roadmap: {
    art: 'roadmap', accent: '#C6FF3D', accent2: '#8FEA34', tag: '学習ロードマップ',
    kicker: 'START → GOAL', action: '合格までの道筋をつかむ'
  },
  compare: {
    art: 'compare', accent: '#FFB23F', accent2: '#FF7B31', tag: '資格比較',
    kicker: 'CHOOSE ONE', action: '違いを比べて選ぶ'
  },
  accounting: {
    art: 'accounting', accent: '#B79BFF', accent2: '#8B63FF', tag: '簿記・会計',
    kicker: 'POINTS', action: '仕組みから理解する'
  },
  legal: {
    art: 'legal', accent: '#55E3E5', accent2: '#20BFC5', tag: '法律資格',
    kicker: 'KEY POINTS', action: '重要な論点を整理する'
  },
  it: {
    art: 'it', accent: '#59BEFF', accent2: '#3485EF', tag: 'IT・技術',
    kicker: 'SKILL MAP', action: '全体像から攻略する'
  },
  english: {
    art: 'english', accent: '#FFC45A', accent2: '#F18B2D', tag: '英語資格',
    kicker: 'SCORE UP', action: '目標までの手順を知る'
  },
  career: {
    art: 'career', accent: '#FF7CAD', accent2: '#F05287', tag: '資格・キャリア',
    kicker: 'NEXT STEP', action: '目的から次を選ぶ'
  },
  problem: {
    art: 'problem', accent: '#FF846F', accent2: '#F14B4B', tag: '学習のつまずき',
    kicker: 'BREAK THROUGH', action: '止まった理由をほどく'
  }
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sourceText(article) {
  return `${article.label || ''} ${article.title || ''}`;
}

function familyOf(article) {
  const text = sourceText(article);
  if (/(?:\bvs\b|VS|比較|どっち|違い|選ぶべき)/i.test(text)) return 'compare';
  if (/(?:落ちた|挫折|続かない|ケアレス|ミス|間違|解けない|苦手|諦め|失敗|立て直)/.test(text)) return 'problem';
  if (/(?:IT|情報|MOS|プログラミング|電気|危険物|ソフトウェア)/i.test(text)) return 'it';
  if (/(?:TOEIC|英検|IELTS|TOEFL|英語|漢検)/i.test(text)) return 'english';
  if (/(?:宅建|行政書士|司法書士|社労士|法律|民法|登記|不動産|マンション)/.test(text)) return 'legal';
  if (/(?:ランキング|おすすめ|就活|転職|大学生|社会人|働きながら|キャリア)/.test(text)) return 'career';
  if (/(?:ロードマップ|スケジュール|日程|何日|最短|次の試験|進捗|勉強時間|受ける)/.test(text)) return 'roadmap';
  if (/(?:簿記|会計|仕訳|原価|決算|財務|税理士|公認会計士|FP|金融|保険|年金|相続)/.test(text)) return 'accounting';
  return 'roadmap';
}

function normalize(value) {
  return String(value || '')
    .replace(/^日商/, '')
    .replace(/（[^）]+）/g, '')
    .replace(/[｜|].*$/, '')
    .replace(/(?:の)?(?:独学)?(?:勉強法|合格ガイド|完全ガイド|攻略ガイド|スコアアップ戦略|独学合格ガイド)/g, '')
    .replace(/を完全解説/g, '')
    .replace(/徹底比較/g, '比較')
    .replace(/\s+/g, ' ')
    .trim();
}

function topicFor(article, family) {
  const title = normalize(article.title);
  const label = normalize(article.label);
  const text = sourceText(article);
  if (family === 'compare') {
    return title.replace(/どっちを先に取るべき.*$/, 'どっちを選ぶ？');
  }
  if (family === 'problem') {
    if (/落ちた|不合格/.test(text)) return '落ちた後の立て直し';
    if (/続かない|挫折/.test(text)) return '続かない理由を突破';
    if (/ミス|間違/.test(text)) return 'ミスを減らす方法';
    return title;
  }
  if (family === 'roadmap') {
    const base = label || title.match(/(?:簿記\d級|FP\d級|宅建士|公認会計士|税理士|行政書士|司法書士|社労士)/)?.[0] || title;
    if (/何日/.test(text)) return `${base}は何日で受ける？`;
    if (/勉強時間/.test(text)) return `${base} 勉強時間の目安`;
    if (/日程|試験日/.test(text)) return `${base} 試験日までの計画`;
    return `${base} 最短スケジュール`;
  }
  if (family === 'career') {
    if (/ランキング|おすすめ/.test(text)) return `${label || title}を比べる`;
    return title;
  }
  return title || label || '資格学習ガイド';
}

function headlineLinesFor(article, family) {
  if (family === 'compare') {
    const sides = normalize(article.title)
      .split(/\s*(?:vs|VS)\s*/i)
      .map(side => side.replace(/[？?].*$/, '').replace(/どっちを先に取るべき.*$/, '').trim())
      .filter(Boolean);
    if (sides.length === 2) return [sides[0].slice(0, 10), `VS ${sides[1].slice(0, 9)}`];
  }
  return linesFor(topicFor(article, family));
}

function linesFor(value, max = 9) {
  const characters = Array.from(normalize(value));
  if (characters.length <= max) return [characters.join('')];
  const lines = [];
  while (characters.length && lines.length < 2) lines.push(characters.splice(0, max).join(''));
  if (characters.length) {
    const tail = lines.pop();
    lines.push(`${tail.slice(0, Math.max(1, max - 1))}…`);
  }
  return lines.filter(Boolean);
}

function shortLabel(article, theme) {
  const label = normalize(article.label);
  if (label && label.length <= 12) return label;
  return theme.tag;
}

function textBlock(lines) {
  const size = lines.some(line => Array.from(line).length > 9) ? 31 : 37;
  const lineHeight = size + 7;
  const start = lines.length === 1 ? 172 : 152;
  return lines.map((line, index) => `<text x="34" y="${start + index * lineHeight}" class="headline" style="font-size:${size}px">${esc(line)}</text>`).join('');
}

function buildSvg(article, artData) {
  const family = familyOf(article);
  const theme = THEMES[family];
  const titleLines = headlineLinesFor(article, family);
  const badge = shortLabel(article, theme);
  const badgeWidth = Math.min(195, Math.max(92, Array.from(badge).length * 15 + 30));
  const slug = article.file.replace(/\.html$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-labelledby="title-${slug} desc-${slug}" data-art="${theme.art}">
  <title id="title-${slug}">${esc(article.title)}のメッセージ型サムネイル</title>
  <desc id="desc-${slug}">${esc(badge)}。${esc(titleLines.join(' '))}。${esc(theme.action)}</desc>
  <defs>
    <linearGradient id="veil" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#071126" stop-opacity=".96"/><stop offset=".44" stop-color="#071126" stop-opacity=".82"/><stop offset=".77" stop-color="#071126" stop-opacity=".18"/><stop offset="1" stop-color="#071126" stop-opacity="0"/></linearGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#D8F8FF" stroke-opacity=".08"/></pattern>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#000" flood-opacity=".5"/></filter>
    <style>
      .tag{font:800 13px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;letter-spacing:.08em;fill:#081222}.eyebrow{font:800 12px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;letter-spacing:.12em;fill:${theme.accent}}.headline{font-family:'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;font-weight:900;letter-spacing:-.045em;fill:#FFF;paint-order:stroke;stroke:#071126;stroke-width:3px;stroke-linejoin:round}.note{font:700 13px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;fill:#D6E2F0}.kicker{font:900 12px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;letter-spacing:.06em;fill:#081222}
    </style>
  </defs>
  <rect width="640" height="360" rx="18" fill="#09152A"/>
  <image href="data:image/jpeg;base64,${artData.get(theme.art)}" x="0" y="0" width="640" height="360" preserveAspectRatio="xMidYMid meet"/>
  <rect width="640" height="360" rx="18" fill="url(#veil)"/>
  <rect width="640" height="360" rx="18" fill="url(#grid)"/>
  <rect x="27" y="27" width="${badgeWidth}" height="30" rx="15" fill="${theme.accent}" filter="url(#shadow)"/>
  <text x="42" y="47" class="tag">${esc(badge)}</text>
  <circle cx="39" cy="93" r="5" fill="${theme.accent}"/><text x="54" y="98" class="eyebrow">STUDY QUEST / ARTICLE GUIDE</text>
  ${textBlock(titleLines)}
  <rect x="27" y="282" width="214" height="42" rx="10" fill="#081222" fill-opacity=".76" stroke="${theme.accent}" stroke-opacity=".52"/>
  <text x="43" y="308" class="kicker">${esc(theme.kicker)}</text>
</svg>`;
}

const artData = new Map();
for (const theme of Object.values(THEMES)) {
  const jpegPath = path.join(artDir, `${theme.art}.jpg`);
  if (!fs.existsSync(jpegPath)) throw new Error(`背景イラストがありません: ${path.relative(root, jpegPath)}`);
  artData.set(theme.art, fs.readFileSync(jpegPath).toString('base64'));
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
const manifest = [];
for (const [file, article] of Object.entries(ARTICLES)) {
  const slug = file.replace(/\.html$/, '');
  fs.writeFileSync(path.join(outputDir, `${slug}.svg`), buildSvg({ ...article, file }, artData));
  manifest.push({ file, slug, label: article.label, title: article.title, family: familyOf(article), art: THEMES[familyOf(article)].art });
}
fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${manifest.length} article thumbnails with ${new Set(manifest.map(item => item.art)).size} illustration backgrounds.`);
