#!/usr/bin/env node
// Usage: node scripts/generate-ogp.js <config.json|inline-json> [output-path]
// Generates an OGP SVG (1200x630) matching Study Quest's existing images/ogp-source/*.svg template.
//
// Config fields:
//   slug        (required unless output-path given) -> images/ogp-source/<slug>-ogp.svg
//   tag         (required) badge text, e.g. "日商簿記1級"
//   subtitle    (required) bottom bar text
//   mode        "single" (default) | "vs"
//   lines       mode:single -> [{ text, size, color, y }]  (y defaults spread around center)
//   left, right mode:vs -> { text, color }
//   termSize    default font-size for term text (default 54)
//   tagColor    badge fill (default "#1A202C")
//   bg          { from, to } single gradient, or { left:{from,to}, right:{from,to} } split gradient

const fs = require('fs');
const path = require('path');

const FONT_CSS = `"Hiragino Sans","Noto Sans JP",system-ui,sans-serif`;
const FONT_ATTR = `Hiragino Sans,Noto Sans JP,system-ui,sans-serif`;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tagWidthFor(text) {
  const w = text.length * 30 + 80;
  return Math.min(400, Math.max(180, Math.round(w / 2) * 2));
}

function defaultLines(lines, termSize) {
  if (lines.length === 1) return [{ y: 300, size: termSize, ...lines[0] }];
  if (lines.length === 2) return [
    { y: 270, size: termSize, ...lines[0] },
    { y: 330, size: termSize, ...lines[1] },
  ];
  throw new Error('mode:single supports 1 or 2 lines; pass explicit y/size for more');
}

function buildSVG(cfg) {
  const {
    tag,
    tagColor = '#1A202C',
    subtitle,
    bg = { from: '#EBF8FF', to: '#ffffff' },
    mode = 'single',
    lines = [],
    left,
    right,
    termSize = 54,
  } = cfg;

  const tagWidth = cfg.tagWidth || tagWidthFor(tag);
  const tagX = 1160 - tagWidth;
  const tagTextX = tagX + tagWidth / 2;

  let bgDefs, bgRects;
  if (bg.left && bg.right) {
    bgDefs = `
    <linearGradient id="bgL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg.left.from}"/><stop offset="1" stop-color="${bg.left.to}"/></linearGradient>
    <linearGradient id="bgR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg.right.from}"/><stop offset="1" stop-color="${bg.right.to}"/></linearGradient>`;
    bgRects = `
  <rect width="600" height="630" fill="url(#bgL)"/>
  <rect x="600" width="600" height="630" fill="url(#bgR)"/>`;
  } else {
    bgDefs = `
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg.from}"/><stop offset="1" stop-color="${bg.to}"/></linearGradient>`;
    bgRects = `
  <rect width="1200" height="630" fill="url(#bg)"/>`;
  }

  let contentSVG;
  if (mode === 'vs') {
    contentSVG = `
  <text x="300" y="300" text-anchor="middle" class="term" font-size="${termSize}" fill="${left.color}">${esc(left.text)}</text>
  <text x="900" y="300" text-anchor="middle" class="term" font-size="${termSize}" fill="${right.color}">${esc(right.text)}</text>
  <circle cx="600" cy="280" r="54" fill="#1A202C"/>
  <text x="600" y="292" text-anchor="middle" class="vs">VS</text>`;
  } else {
    contentSVG = defaultLines(lines, termSize)
      .map(l => `  <text x="600" y="${l.y}" text-anchor="middle" class="term" font-size="${l.size}" fill="${l.color}">${esc(l.text)}</text>`)
      .join('\n');
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>${bgDefs}
    <style>
      .logo{font-family:${FONT_CSS};font-size:26px;font-weight:800;fill:#276749}
      .term{font-family:${FONT_CSS};font-weight:900}
      .vs{font-family:${FONT_CSS};font-size:32px;font-weight:900;fill:#ffffff}
      .sub{font-family:${FONT_CSS};font-size:26px;font-weight:700;fill:#1f2937}
      .tag{font-family:${FONT_CSS};font-size:21px;font-weight:800;fill:#ffffff}
    </style>
  </defs>${bgRects}
  <rect width="1200" height="630" fill="none" stroke="#E2E8F0" stroke-width="2"/>

  <rect x="40" y="36" width="40" height="40" rx="10" fill="#8CC63F"/>
  <text x="60" y="63" text-anchor="middle" font-family="${FONT_ATTR}" font-size="16" font-weight="900" fill="#fff">SQ</text>
  <text x="92" y="64" class="logo">スタディクエスト</text>
  <rect x="${tagX}" y="36" width="${tagWidth}" height="42" rx="21" fill="${tagColor}"/>
  <text x="${tagTextX}" y="64" text-anchor="middle" class="tag">${esc(tag)}</text>
${contentSVG}

  <rect x="120" y="470" width="960" height="94" rx="16" fill="rgba(255,255,255,.88)" stroke="#E2E8F0" stroke-width="2"/>
  <text x="600" y="527" text-anchor="middle" class="sub">${esc(subtitle)}</text>
</svg>
`;
}

function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/generate-ogp.js <config.json|inline-json> [output-path]');
    process.exit(1);
  }
  const cfg = fs.existsSync(arg) ? JSON.parse(fs.readFileSync(arg, 'utf8')) : JSON.parse(arg);
  const outPath = process.argv[3] || path.join('images', 'ogp-source', `${cfg.slug}-ogp.svg`);
  fs.writeFileSync(outPath, buildSVG(cfg));
  console.log(`Generated: ${outPath}`);
}

main();
