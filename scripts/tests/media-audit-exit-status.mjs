import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'study-quest-audit-status-'));
const date = '20990101';
const preload = path.join(temp, 'fetch-fixture.mjs');
// Exercise the real CLI without network access or modifying repository reports.
await fs.writeFile(preload, `
const scenario = process.env.MEDIA_AUDIT_SCENARIO;
globalThis.fetch = async (url) => {
  if (scenario === 'network-error') throw new Error('Synthetic network failure');
  if (scenario === 'page-404') return new Response('Not found', {status: 404});
  if (new URL(url).pathname === '/audit-fixture.png') {
    return new Response('', {status: scenario === 'image-404' ? 404 : 200});
  }
  const canonical = scenario === 'missing-canonical' ? '' : '<link rel="canonical" href="' + url + '">';
  const json = scenario === 'invalid-json' ? '{broken' : '{"@type":"Article"}';
  return new Response('<title>Audit fixture</title>' + canonical +
    '<meta property="og:image" content="https://study-quest.net/audit-fixture.png">' +
    '<script type="application/ld+json">' + json + '</script>' +
    '<img src="/audit-fixture.png">', {status: 200});
};
`);

try {
  for (const scenario of ['healthy', 'page-404', 'network-error', 'missing-canonical', 'invalid-json', 'image-404']) {
    const output = path.join(temp, scenario);
    const result = spawnSync(process.execPath, [
      '--import', preload, path.join(root, 'scripts/audits/run-media-audits.mjs'),
      '--mode', scenario === 'page-404' ? 'all' : 'production', '--output-dir', output,
    ], { cwd: root, encoding: 'utf8', env: { ...process.env, AUDIT_DATE: date, MEDIA_AUDIT_SCENARIO: scenario } });
    assert.ifError(result.error);
    assert.equal(result.status, scenario === 'healthy' ? 0 : 1, `${scenario}: ${result.stderr}`);
    const report = await fs.readFile(path.join(output, `${date}-production-monitor.md`), 'utf8');
    assert.match(report, /ページ確認: 12件/);
    if (scenario === 'healthy') {
      assert.match(report, /ページ要確認: \*\*0件\*\*/);
      assert.match(report, /画像404・取得失敗: \*\*0件\*\*/);
    } else {
      assert.match(result.stderr, /Production audit found/);
      assert.match(report, scenario === 'image-404' ? /画像404・取得失敗: \*\*12件\*\*/ : /ページ要確認: \*\*12件\*\*/);
    }
    if (scenario === 'page-404') {
      assert.equal((await fs.readdir(output)).length, 3, 'all reports must be saved before failure');
    }
    console.log(`PASS ${scenario}: exit ${result.status}, report retained`);
  }
  const noWrite = path.join(temp, 'no-write');
  const result = spawnSync(process.execPath, ['--import', preload,
    path.join(root, 'scripts/audits/run-media-audits.mjs'), '--mode', 'production',
    '--no-write', '--output-dir', noWrite,
  ], { encoding: 'utf8', env: { ...process.env, AUDIT_DATE: date, MEDIA_AUDIT_SCENARIO: 'page-404' } });
  assert.ifError(result.error);
  assert.equal(result.status, 1);
  await assert.rejects(fs.access(noWrite));
  console.log('PASS no-write: failure signalled without creating reports');
} finally {
  await fs.rm(temp, { recursive: true, force: true });
}
