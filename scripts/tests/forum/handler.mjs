import { handle } from '../../../supabase/functions/learning-forum/index.ts';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const results = [];
const fake = { SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only-service-value', SUPABASE_ANON_KEY: 'test-only-public-value' };
const visitor_id = 'e0042e72-1228-4910-96b2-4b08e728f336';
const env = key => fake[key];
const make = (data = { action: 'list', payload: {}, visitor_id }, headers = {}, method = 'POST') => new Request('https://example.invalid/functions/v1/learning-forum', { method, headers: { origin: 'https://study-quest.net', apikey: fake.SUPABASE_ANON_KEY, 'content-type': 'application/json', ...headers }, ...(method === 'POST' ? { body: typeof data === 'string' ? data : JSON.stringify(data) } : {}) });
async function test(name, fn) { await fn(); results.push({ name, passed: true }); console.log('PASS', name); }
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
let calls = [];
const transport = async (url, options) => { calls.push({ url, options }); return json({ threads: [], has_more: false }); };
await test('正規Origin、APIキー、形式を検証し、別Originや未接続を拒否する', async () => {
  assert.equal((await handle(make(), env, transport)).status, 200);
  assert.equal((await handle(make({}, { origin: 'https://evil.invalid' }), env, transport)).status, 403);
  assert.equal((await handle(make({}, { apikey: 'wrong' }), env, transport)).status, 401);
  assert.equal((await handle(make(), () => undefined, transport)).status, 503);
  assert.equal((await handle(make(null, {}, 'GET'), env, transport)).status, 405);
  assert.equal((await handle(make(null, {}, 'OPTIONS'), env, transport)).status, 204);
});
await test('不正JSON・操作・長すぎる送信をDB処理の前に拒否する', async () => {
  assert.equal((await handle(make('{'), env, transport)).status, 400);
  assert.equal((await handle(make({ action: 'drop_tables', payload: {}, visitor_id }), env, transport)).status, 400);
  assert.equal((await handle(make({ action: 'list', payload: {}, visitor_id: 'bad' }), env, transport)).status, 400);
  assert.equal((await handle(make({ action: 'reply', payload: { body: 'a'.repeat(17000) }, visitor_id }), env, transport)).status, 413);
});
await test('匿名リクエストから管理者フラグを注入できず、生のブラウザ識別子をDBに送らない', async () => {
  calls = [];
  await handle(make({ action: 'reply', payload: { p_is_admin: true }, visitor_id, p_is_admin: true }), env, transport);
  const params = JSON.parse(calls[0].options.body); assert.equal(params.p_is_admin, false); assert.match(params.p_actor_hash, /^[0-9a-f]{64}$/); assert.equal(calls[0].options.body.includes(visitor_id), false);
});
await test('管理操作は匿名キーで実行できず、本物のログインと管理者判定を両方要求する', async () => {
  const data = { action: 'admin_queue', payload: {}, visitor_id };
  assert.equal((await handle(make(data, { authorization: `Bearer ${fake.SUPABASE_ANON_KEY}` }), env, transport)).status, 401);
  const userToken = 'Bearer test-only-user-session';
  let checked = [];
  const nonAdmin = async url => { checked.push(url); return url.endsWith('/user') ? json({ id: 'test-only-user-id' }) : json(false); };
  assert.equal((await handle(make(data, { authorization: userToken }), env, nonAdmin)).status, 403); assert.equal(checked.length, 2);
  const invalid = async () => json({ error: 'invalid' }, 401);
  assert.equal((await handle(make(data, { authorization: userToken }), env, invalid)).status, 401);
  let last;
  const admin = async (url, options) => {
    if (url.endsWith('/user')) return json({ id: 'test-only-user-id' });
    if (url.endsWith('/is_admin')) return json(true);
    last = JSON.parse(options.body); return json({ pending: [], reports: [], pending_count: 0 });
  };
  assert.equal((await handle(make(data, { authorization: userToken }), env, admin)).status, 200); assert.equal(last.p_is_admin, true);
});
await test('DBエラーの詳細・ホスト用キーを応答に含めず、通信不明を成功扱いにしない', async () => {
  const internal = async () => json({ code: 'XX000', message: `Internal server error ${fake.SUPABASE_SERVICE_ROLE_KEY}` }, 500);
  let r = await handle(make(), env, internal); assert.equal(r.status, 400); assert.equal((await r.text()).includes(fake.SUPABASE_SERVICE_ROLE_KEY), false);
  r = await handle(make(), env, async () => { throw new Error('network'); }); assert.equal(r.status, 503);
});
console.log(JSON.stringify({ environment: 'Node strip-types / synthetic HTTP, Auth and DB transports only', results, unconfirmed: ['Hosted Edge gateway validation of the legacy anonymous JWT and existing admin sessions', 'Actual deployed request delivery and database persistence'] }, null, 2));
