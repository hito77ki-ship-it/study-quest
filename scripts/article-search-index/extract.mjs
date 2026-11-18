import { parse } from 'parse5';

const excluded = new Set(['script', 'style', 'nav', 'footer', 'svg']);
const htmlSpaces = /[\t\n\f\r ]+/;
const collapse = text => text.replace(/\s+/g, ' ').trim();

function* descendants(node, skip) {
  if (skip?.has(node.tagName)) return;
  yield node;
  // Template content lives in a separate document fragment, just as in the DOM.
  for (const child of node.childNodes || []) yield* descendants(child, skip);
}

function attr(node, name) {
  return node?.attrs?.find(attribute => attribute.name === name)?.value || '';
}

function textContent(node, skip) {
  let text = '';
  for (const child of descendants(node, skip)) {
    if (child.nodeName === '#text') text += child.value;
  }
  return text;
}

function findModified(value) {
  if (!value || typeof value !== 'object') return '';
  const direct = String(value.dateModified || '').match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (direct) return direct;
  for (const child of Object.values(value)) {
    const date = findModified(child);
    if (date) return date;
  }
  return '';
}

// Mirrors the existing browser extraction (DOMParser, textContent and slice in UTF-16).
export function extractArticle(html, file) {
  const doc = parse(html, { scriptingEnabled: false });
  const nodes = [...descendants(doc)];
  const canonical = nodes.find(n => n.tagName === 'link' && attr(n, 'rel').toLowerCase().split(htmlSpaces).includes('canonical'));
  const href = attr(canonical, 'href');
  const expected = new URL(file, 'https://study-quest.net/');
  if (!href || new URL(href, expected).href !== expected.href) throw new Error('missing or mismatched canonical');

  const meta = nodes.find(n => n.tagName === 'meta' && attr(n, 'name') === 'description');
  const description = collapse(attr(meta, 'content'));
  if (!description) throw new Error('missing meta description');
  let modified = '';
  for (const node of nodes) {
    if (node.tagName !== 'script' || attr(node, 'type').toLowerCase() !== 'application/ld+json') continue;
    let data;
    try { data = JSON.parse(textContent(node)); } catch { continue; }
    modified = findModified(data);
    if (modified) break;
  }
  if (!modified) throw new Error('missing JSON-LD dateModified');

  // querySelector('main,.container,article') uses document order, not selector priority.
  let body;
  let main;
  for (const node of descendants(doc, excluded)) {
    if (node.tagName === 'body') body = node;
    if (node.tagName === 'main' || node.tagName === 'article' || attr(node, 'class').split(htmlSpaces).includes('container')) {
      main = node;
      break;
    }
  }
  const content = textContent(main || body, excluded);
  if (!collapse(content)) throw new Error('empty article body');
  return { description, modified, text: collapse(`${description} ${content}`).slice(0, 12000) };
}
