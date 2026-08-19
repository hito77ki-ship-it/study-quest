#!/usr/bin/env node
/**
 * 記事カード用のメッセージ型SVGサムネイルを生成する。
 *
 * 写真調の「机・本」だけでは記事を選ぶ理由にならないため、ARTICLES台帳の
 * 正しいタイトル・カテゴリを使い、比較／ロードマップ／論点整理を先に伝える。
 * SVGを採用することで、日本語テキストと記事の対応を機械検証できる。
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'article-widgets.js');
const outputDir = path.join(root, 'images', 'article-diagrams');

const source = fs.readFileSync(sourcePath, 'utf8');
const match = source.match(/const ARTICLES = (\{[\s\S]*?\n\});\n\n\/\*/);
if (!match) throw new Error('ARTICLES台帳を article-widgets.js から読み取れません。');
const ARTICLES = vm.runInNewContext(`(${match[1]})`);

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function familyOf(article) {
  const sourceText = `${article.label} ${article.title}`;
  if (/(?:\bvs\b|VS|比較|どっち|違い|選ぶべき)/i.test(sourceText)) return 'compare';
  if (/(?:ロードマップ|スケジュール|日程|何日|最短|次の試験|進捗|続かない|挫折|落ちた|立て直)/.test(sourceText)) return 'roadmap';
  if (/(?:簿記|会計|仕訳|原価|決算|財務|税理士|公認会計士|FP|金融|保険|年金|相続)/.test(sourceText)) return 'accounting';
  if (/(?:宅建|行政書士|司法書士|社労士|法律|民法|登記|不動産|マンション)/.test(sourceText)) return 'legal';
  if (/(?:IT|情報|MOS|プログラミング|電気|危険物|ソフトウェア)/i.test(sourceText)) return 'it';
  if (/(?:TOEIC|英検|IELTS|TOEFL|英語|漢検)/i.test(sourceText)) return 'english';
  if (/(?:ランキング|おすすめ|就活|転職|大学生|社会人|働きながら|キャリア)/.test(sourceText)) return 'career';
  return 'study';
}

const PALETTES = {
  compare:    { accent:'#FFB545', accent2:'#F97316', panel:'#FFF4DE', ink:'#FFF8EB', label:'資格比較' },
  roadmap:    { accent:'#B7F34A', accent2:'#7AC943', panel:'#E8FFD1', ink:'#F8FFEE', label:'学習ロードマップ' },
  accounting: { accent:'#B79CFF', accent2:'#7C5CFA', panel:'#F0EBFF', ink:'#FAF8FF', label:'簿記・会計' },
  legal:      { accent:'#54D4D2', accent2:'#159C9A', panel:'#DBFAF6', ink:'#F0FFFF', label:'法律資格' },
  it:         { accent:'#69C5FF', accent2:'#2772E8', panel:'#E5F2FF', ink:'#F4FAFF', label:'IT・技術' },
  english:    { accent:'#FFB95A', accent2:'#EA7B1E', panel:'#FFF0D9', ink:'#FFF9F0', label:'英語資格' },
  career:     { accent:'#FF81B8', accent2:'#E43D82', panel:'#FFE2F0', ink:'#FFF5FA', label:'資格選び' },
  study:      { accent:'#A7E84A', accent2:'#5AAE39', panel:'#E8F9D7', ink:'#F8FFF2', label:'学習ガイド' }
};

function trimTitle(title) {
  return title
    .replace(/^日商/, '')
    .replace(/（[^）]+）/g, '')
    .replace(/[｜|].*$/, '')
    .replace(/の(?:独学)?(?:勉強法|合格ガイド|完全ガイド|攻略ガイド|スコアアップ戦略)/g, '')
    .replace(/徹底比較/g, '比較')
    .replace(/を完全解説/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitTitle(title, kind) {
  const cleaned = trimTitle(title);
  if (kind === 'compare') {
    const parts = cleaned.split(/\s*(?:vs|VS)\s*/i);
    if (parts.length === 2) return [parts[0].slice(0, 13), parts[1].slice(0, 13)];
  }
  const separators = ['・', '、', '？', '?', 'と', 'から', 'まで', 'の'];
  const target = Math.min(14, Math.max(8, Math.ceil(cleaned.length / 2)));
  let cut = -1;
  for (const separator of separators) {
    const position = cleaned.lastIndexOf(separator, target);
    if (position > 4) cut = Math.max(cut, position + (separator === 'と' || separator === 'の' ? 1 : 0));
  }
  if (cut < 0) cut = target;
  const first = cleaned.slice(0, cut).trim();
  const second = cleaned.slice(cut).trim();
  return [first.slice(0, 16) || '学習ガイド', second.slice(0, 16) || actionFor(kind)];
}

function actionFor(kind) {
  return {
    compare:'どっちを選ぶ？', roadmap:'START → GOAL', accounting:'仕組みを図解', legal:'要点を整理',
    it:'全体像をつかむ', english:'目標までの道筋', career:'目的から選ぶ', study:'次の一手がわかる'
  }[kind];
}

function iconSvg(kind, palette, left, right) {
  const common = `fill="none" stroke="${palette.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
  if (kind === 'compare') return `
    <rect x="398" y="113" width="105" height="158" rx="18" fill="#121D35" stroke="${palette.accent}" stroke-width="3"/>
    <rect x="531" y="113" width="105" height="158" rx="18" fill="#121D35" stroke="${palette.accent}" stroke-width="3"/>
    <text x="450" y="175" text-anchor="middle" class="side">${esc(left)}</text><text x="583" y="175" text-anchor="middle" class="side">${esc(right)}</text>
    <circle cx="517" cy="192" r="31" fill="${palette.accent2}"/><text x="517" y="202" text-anchor="middle" class="vs">VS</text>
    <path d="M440 230h35m84 0h35" ${common}/>`;
  if (kind === 'roadmap') return `
    <path d="M404 228h70l30-50 34 62 44-98 58 0" ${common}/>
    <circle cx="404" cy="228" r="13" fill="${palette.accent2}"/><circle cx="504" cy="178" r="13" fill="${palette.accent2}"/><circle cx="538" cy="240" r="13" fill="${palette.accent2}"/>
    <rect x="562" y="106" width="80" height="66" rx="10" fill="${palette.panel}" stroke="${palette.accent}" stroke-width="3"/>
    <path d="M574 133h56m-46 15h36" ${common}/><text x="602" y="277" text-anchor="middle" class="goal">GOAL</text>`;
  if (kind === 'accounting') return `
    <rect x="400" y="103" width="240" height="178" rx="16" fill="#121D35" stroke="${palette.accent}" stroke-width="3"/>
    <path d="M420 144h200M420 184h200M420 224h200M490 124v137M560 124v137" ${common}/>
    <circle cx="453" cy="164" r="11" fill="${palette.accent2}"/><circle cx="523" cy="204" r="11" fill="${palette.accent}"/><circle cx="593" cy="244" r="11" fill="${palette.accent2}"/>`;
  if (kind === 'legal') return `
    <path d="M520 104v146M452 139h136M471 139l-33 67h66l-33-67M569 139l-33 67h66l-33-67M482 250h76" ${common}/>
    <circle cx="520" cy="93" r="12" fill="${palette.accent2}"/><path d="M450 270h140" ${common}/>`;
  if (kind === 'it') return `
    <rect x="401" y="106" width="238" height="164" rx="16" fill="#121D35" stroke="${palette.accent}" stroke-width="3"/>
    <circle cx="425" cy="130" r="7" fill="${palette.accent2}"/><circle cx="449" cy="130" r="7" fill="${palette.accent}"/>
    <path d="M433 172l-18 16 18 16m32-32 18 16-18 16M502 212l15-49M543 176h58m-58 30h44" ${common}/>`;
  if (kind === 'english') return `
    <path d="M407 144q0-30 30-30h104q30 0 30 30v58q0 30-30 30h-57l-42 32v-32h-5q-30 0-30-30z" fill="#121D35" stroke="${palette.accent}" stroke-width="3"/>
    <text x="489" y="183" text-anchor="middle" class="letters">A B C</text><path d="M588 129v115M577 218l11 22 11-22" ${common}/>`;
  if (kind === 'career') return `
    <path d="M406 261h227M430 248v-59h43v59M488 248v-101h43v101M546 248V111h43v137" fill="#121D35" stroke="${palette.accent}" stroke-width="3"/>
    <path d="M420 175l57-49 47 19 84-73" ${common}/><path d="M588 72h20v20" ${common}/>`;
  return `
    <circle cx="520" cy="185" r="77" fill="#121D35" stroke="${palette.accent}" stroke-width="3"/>
    <path d="M520 129v56l38 24M520 94v14M520 262v14M429 185h14M597 185h14" ${common}/>
    <circle cx="520" cy="185" r="9" fill="${palette.accent2}"/>`;
}

function buildSvg(file, article) {
  const kind = familyOf(article);
  const palette = PALETTES[kind];
  const [first, second] = splitTitle(article.title, kind);
  const left = first || article.label;
  const right = second || actionFor(kind);
  const imageLabel = article.label || palette.label;
  const titleSize = first.length > 12 ? 26 : 31;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-labelledby="title desc">
  <title id="title">${esc(article.title)}の図解サムネイル</title>
  <desc id="desc">${esc(imageLabel)}。${esc(first)}、${esc(second)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#152447"/><stop offset="1" stop-color="#0A1126"/></linearGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#FFFFFF" stroke-opacity=".055"/></pattern>
    <style>
      .font{font-family:'Hiragino Sans','Noto Sans JP',system-ui,sans-serif}.tag{font:700 13px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;letter-spacing:.08em;fill:#0A1126}.h1{font:800 ${titleSize}px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;fill:#FFFFFF}.h2{font:700 18px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;fill:${palette.ink}}.note{font:700 12px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;fill:#B7C6E6}.side{font:800 16px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;fill:#FFFFFF}.vs{font:900 18px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;fill:#0A1126}.goal{font:900 14px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;fill:${palette.accent}}.letters{font:800 28px 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;fill:${palette.accent}}
    </style>
  </defs>
  <rect width="640" height="360" rx="18" fill="url(#bg)"/><rect width="640" height="360" rx="18" fill="url(#grid)"/>
  <rect x="28" y="28" width="${Math.min(166, Math.max(92, imageLabel.length * 15 + 26))}" height="30" rx="15" fill="${palette.accent}"/>
  <text x="42" y="48" class="tag">${esc(imageLabel)}</text>
  <circle cx="60" cy="100" r="7" fill="${palette.accent}"/><path d="M76 100h64" stroke="#FFFFFF" stroke-opacity=".28" stroke-width="2"/>
  <text x="34" y="151" class="h1">${esc(first)}</text>
  <text x="34" y="190" class="h1">${esc(second)}</text>
  <text x="35" y="228" class="note">記事の要点をひと目でつかむ</text>
  <rect x="28" y="281" width="285" height="45" rx="12" fill="#FFFFFF" fill-opacity=".10" stroke="#FFFFFF" stroke-opacity=".18"/>
  <text x="48" y="310" class="h2">${esc(actionFor(kind))}</text>
  ${iconSvg(kind, palette, left, right)}
</svg>`
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n');
}

fs.rmSync(outputDir, { recursive:true, force:true });
fs.mkdirSync(outputDir, { recursive:true });
const manifest = [];
for (const [file, article] of Object.entries(ARTICLES)) {
  const slug = file.replace(/\.html$/, '');
  fs.writeFileSync(path.join(outputDir, `${slug}.svg`), buildSvg(file, article));
  manifest.push({ file, slug, label:article.label, title:article.title, family:familyOf(article) });
}
fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${manifest.length} article diagrams in ${path.relative(root, outputDir)}.`);
