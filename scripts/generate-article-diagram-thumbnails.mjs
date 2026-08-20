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
const recoveredArtDir = path.join(artDir, 'recovered');

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

// この会話で既に生成した「文字＋図解」一体型の完成サムネイル。
// 記事の資格名・比較軸・テーマが一致するものだけを明示して採用する。
// それ以外は、正確なSVG文字組を重ねる既定テンプレートを使う。
const RECOVERED_THUMBNAILS = {
  'boki.html': 'boki.jpg',
  'boki1.html': 'boki1.jpg',
  'boki2.html': 'boki2.jpg',
  'boki2-chokusetsu-genka.html': 'boki2-chokusetsu-genka.jpg',
  'boki2-hyojun-genka.html': 'boki2-hyojun-genka.jpg',
  'boki2-hyojun-vs-jissai.html': 'boki2-hyojun-vs-jissai.jpg',
  'boki2-keihi.html': 'boki2-keihi.jpg',
  'boki2-kobetsu-genka.html': 'boki2-kobetsu-genka.jpg',
  'boki2-kotei-betsu-genka.html': 'boki2-kotei-betsu-genka.jpg',
  'boki2-ochita.html': 'boki2-ochita.jpg',
  'boki2-roumuhi.html': 'boki2-roumuhi.jpg',
  'boki2-sogo-genka.html': 'boki2-sogo-genka.jpg',
  'boki2-zairyouhi.html': 'boki2-zairyouhi.jpg',
  'boki3-kabushiki.html': 'boki3-kabushiki.jpg',
  'boki3-kotei.html': 'boki3-kotei.jpg',
  'boki3-next.html': 'boki3-next.jpg',
  'boki3-ochita.html': 'boki3-ochita.jpg',
  'boki3-progress.html': 'boki3-progress.jpg',
  'boki3-seisanhyo.html': 'boki3-seisanhyo.jpg',
  'boki3-shohi.html': 'boki3-shohi.jpg',
  'boki3-sonota.html': 'boki3-sonota.jpg',
  'cpa.html': 'cpa.jpg',
  'cpa-akirameta-boki1.html': 'cpa-akirameta-boki1.jpg',
  'cpa-akirameta-shinro.html': 'cpa-akirameta-shinro.jpg',
  'cpa-akirameta-shukatsu.html': 'cpa-akirameta-shukatsu.jpg',
  'daigakusei-keizai-shikaku.html': 'daigakusei-keizai-shikaku.jpg',
  'daigakusei-keizoku.html': 'daigakusei-keizoku.jpg',
  'eiken.html': 'eiken.jpg',
  'fp.html': 'fp.jpg',
  'gaibuin.html': 'gaibuin.jpg',
  'gyosei.html': 'gyosei.jpg',
  'hatarakinagara-shikaku.html': 'hatarakinagara-shikaku.jpg',
  'hisho.html': 'hisho.jpg',
  'itp.html': 'itp.jpg',
  'kanken.html': 'kanken.jpg',
  'kenchiku.html': 'kenchiku.jpg',
  'keizoku.html': 'keizoku.jpg',
  'mansion.html': 'mansion.jpg',
  'sharoshi.html': 'sharoshi.jpg',
  'sharoshi-vs-gyosei.html': 'sharoshi-vs-gyosei.jpg',
  'sharoshi-vs-shindanshi.html': 'sharoshi-vs-shindanshi.jpg',
  'shikaku-app.html': 'shikaku-app.jpg',
  'shikaku-eigyo.html': 'shikaku-eigyo.jpg',
  'shikaku-jinsei-kawaru.html': 'shikaku-jinsei-kawaru.jpg',
  'shikaku-zasetsu-riyu.html': 'shikaku-zasetsu-riyu.jpg',
  'shihoshoshi.html': 'shihoshoshi.jpg',
  'shindanshi.html': 'shindanshi.jpg',
  'shukatsu-shikaku.html': 'shukatsu-shikaku.jpg',
  'takken.html': 'takken.jpg',
  'takken-vs-mansion.html': 'takken-vs-mansion.jpg',
  'toefl.html': 'toefl.jpg',
  'toeic-vs-eiken.html': 'toeic-vs-eiken.jpg',
  'univ-ai-report-hack.html': 'univ-ai-report-hack.jpg',
  'univ-boki-units.html': 'univ-boki-units.jpg',
  'zeirishi.html': 'zeirishi.jpg',
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
  const lines = linesFor(topicFor(article, family));
  if (!lines.some(line => line.includes('…'))) return lines;

  // カードでタイトルの途中を読ませるより、短い問いを正確に伝える。
  const text = sourceText(article);
  const label = normalize(article.label) || THEMES[family].tag;
  if (family === 'career') {
    const audience = ['大学生', '社会人', '20代', '30代', '女性', '働きながら', '就活', '転職']
      .find(keyword => text.includes(keyword));
    return [audience ? `${audience}の${label}` : label, '取る意味を整理'];
  }
  if (family === 'problem') return [label, '立て直し方を整理'];
  return [label, THEMES[family].action];
}

function linesFor(value, max = 9) {
  const normalized = normalize(value);
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 2 && words.every(word => Array.from(word).length <= 12)) return words;
  const characters = Array.from(normalized);
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
  const maxChars = Math.max(...lines.map(line => Array.from(line).length));
  const size = maxChars > 11 ? 38 : maxChars > 8 ? 43 : 49;
  const lineHeight = size + 7;
  const start = lines.length === 1 ? 93 : 67;
  return lines.map((line, index) => `<text x="28" y="${start + index * lineHeight}" class="headline" style="font-size:${size}px">${esc(line)}</text>`).join('');
}

function recoveredSvg(article, filename, base64) {
  const slug = article.file.replace(/\.html$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-labelledby="title-${slug} desc-${slug}" data-art="recovered" data-recovered-asset="${esc(filename)}">
  <title id="title-${slug}">${esc(article.title)}の完成サムネイル</title>
  <desc id="desc-${slug}">${esc(article.label)}。${esc(article.title)}を図解で伝える完成サムネイル。</desc>
  <image href="data:image/jpeg;base64,${base64}" x="0" y="0" width="640" height="360" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
}

function buildSvg(article, artData, recoveredArtData) {
  const recoveredFilename = RECOVERED_THUMBNAILS[article.file];
  if (recoveredFilename) return recoveredSvg(article, recoveredFilename, recoveredArtData.get(recoveredFilename));

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
    <linearGradient id="headlineVeil" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#061127" stop-opacity=".96"/><stop offset=".76" stop-color="#061127" stop-opacity=".82"/><stop offset="1" stop-color="#061127" stop-opacity="0"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#000" flood-opacity=".5"/></filter>
    <style>
      .tag{font:900 13px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;letter-spacing:.06em;fill:#071126}.headline{font-family:'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;font-weight:900;letter-spacing:-.06em;fill:#FFF;paint-order:stroke;stroke:#061127;stroke-width:7px;stroke-linejoin:round}.kicker{font:900 13px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;letter-spacing:.02em;fill:#FFF}
    </style>
  </defs>
  <rect width="640" height="360" rx="18" fill="#09152A"/>
  <image href="data:image/jpeg;base64,${artData.get(theme.art)}" x="0" y="0" width="640" height="360" preserveAspectRatio="xMidYMid meet"/>
  <rect width="640" height="158" rx="18" fill="url(#headlineVeil)"/>
  ${textBlock(titleLines)}
  <rect x="27" y="137" width="${badgeWidth}" height="28" rx="7" fill="${theme.accent}" filter="url(#shadow)"/>
  <text x="41" y="156" class="tag">${esc(badge)}</text>
  <rect x="${Math.min(545, badgeWidth + 43)}" y="137" width="${Math.min(190, Array.from(theme.action).length * 14 + 28)}" height="28" rx="7" fill="#061127" fill-opacity=".9" stroke="${theme.accent}" stroke-opacity=".75"/>
  <text x="${Math.min(559, badgeWidth + 57)}" y="156" class="kicker">${esc(theme.action)}</text>
</svg>`;
}

const artData = new Map();
for (const theme of Object.values(THEMES)) {
  const jpegPath = path.join(artDir, `${theme.art}.jpg`);
  if (!fs.existsSync(jpegPath)) throw new Error(`背景イラストがありません: ${path.relative(root, jpegPath)}`);
  artData.set(theme.art, fs.readFileSync(jpegPath).toString('base64'));
}

const recoveredArtData = new Map();
for (const filename of new Set(Object.values(RECOVERED_THUMBNAILS))) {
  const jpegPath = path.join(recoveredArtDir, filename);
  if (!fs.existsSync(jpegPath)) throw new Error(`回収済み完成サムネイルがありません: ${path.relative(root, jpegPath)}`);
  recoveredArtData.set(filename, fs.readFileSync(jpegPath).toString('base64'));
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
const manifest = [];
for (const [file, article] of Object.entries(ARTICLES)) {
  const slug = file.replace(/\.html$/, '');
  const recovered = RECOVERED_THUMBNAILS[file];
  fs.writeFileSync(path.join(outputDir, `${slug}.svg`), buildSvg({ ...article, file }, artData, recoveredArtData));
  manifest.push({
    file,
    slug,
    label: article.label,
    title: article.title,
    family: familyOf(article),
    art: recovered ? 'recovered' : THEMES[familyOf(article)].art,
    asset: recovered ? `recovered/${recovered}` : `${THEMES[familyOf(article)].art}.jpg`,
    render: recovered ? 'exact-generated' : 'template',
  });
}
fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${manifest.length} article thumbnails (${recoveredArtData.size} recovered completion assets + ${new Set(manifest.filter(item => item.render === 'template').map(item => item.art)).size} template backgrounds).`);
