import { PGlite } from '@electric-sql/pglite';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const db = await PGlite.create();
const results = [];
const actor = n => n.toString(16).padStart(64, '0');
let serial = 1;
const request = () => ({ request_id: randomUUID(), consent: true, name: '動作確認用', body: '隔離環境の自作テストです。' });
const call = async (action, payload = {}, admin = false, hash = actor(serial++)) => (await db.query('select public.forum_dispatch($1,$2::jsonb,$3,$4) as result', [action, JSON.stringify(payload), hash, admin])).rows[0].result;
async function test(name, fn) { await fn(); results.push({ name, passed: true }); console.log('PASS', name); }
const q = async (sql, values = []) => (await db.query(sql, values)).rows;
await db.exec('create role anon; create role authenticated; create role service_role;');
await db.exec(await readFile(new URL('../../../supabase_learning_forum.sql', import.meta.url), 'utf8'));
await db.exec('set role service_role');
let thread, first, pending;
const firstRequest = { ...request(), title: '試験用：売掛金と受取手形', category: 'boki', article_url: 'https://study-quest.net/boki3-tegata.html' };
const firstActor = actor(9999);
await test('未承認のスレッド・投稿は公開一覧や個別取得に出ない', async () => {
  first = await call('create', firstRequest, false, firstActor);
  assert.equal(first.status, 'pending');
  const rows = await q('select id,thread_id from forum_private.posts where receipt=$1', [first.receipt]); first.post_id = rows[0].id; thread = rows[0].thread_id;
  assert.equal((await call('list')).threads.length, 0);
  await assert.rejects(call('thread', { thread_id: thread }), /公開されていない/);
});
await test('一般ユーザーの管理操作を拒否する', async () => {
  await assert.rejects(call('moderate', { decision: 'approve', post_id: first.post_id }), /管理者/);
  await assert.rejects(call('admin_queue'), /管理者/);
});
await test('最初の投稿を1件目として承認し、同じ承認の再実行で番号が増えない', async () => {
  assert.equal((await call('moderate', { decision: 'approve', post_id: first.post_id }, true)).seq, 1);
  assert.equal((await call('moderate', { decision: 'approve', post_id: first.post_id }, true)).seq, 1);
  assert.equal((await call('thread', { thread_id: thread })).thread.post_count, 1);
});
await test('通信不明後の同じ受付番号の再送で重複せず、現在の承認状態を返す', async () => {
  const retry = await call('create', firstRequest, false, firstActor);
  assert.equal(retry.receipt, first.receipt); assert.equal(retry.status, 'published');
  assert.equal((await q('select count(*)::int as n from forum_private.posts'))[0].n, 1);
  await assert.rejects(call('create', firstRequest, false, actor(888)), /照合できません/);
});
await test('返信は確認待ちで受け付け、存在する同じスレッドの投稿だけを参照する', async () => {
  pending = await call('reply', { ...request(), thread_id: thread, reply_to: 1 });
  assert.equal((await call('thread', { thread_id: thread })).posts.length, 1);
  const queue = await call('admin_queue', {}, true); assert.equal(queue.pending.length, 1);
  const id = queue.pending[0].id;
  await call('moderate', { decision: 'approve', post_id: id }, true);
  const data = await call('thread', { thread_id: thread }); assert.equal(data.posts[1].seq, 2); assert.equal(data.posts[1].reply_to, 1);
  await assert.rejects(call('reply', { ...request(), thread_id: thread, reply_to: 99 }), /返信先/);
});
await test('空白・改行だけの本文、長すぎる本文、外部URL、未同意をサーバーで拒否する', async () => {
  for (const body of ['', '\n\t　', 'あ'.repeat(1001)]) await assert.rejects(call('reply', { ...request(), body, thread_id: thread }), /本文/);
  for (const url of ['https://example.com/a.html','https://study-quest.net@evil.example/a.html','https://study-quest.net/boki3.html?private=1']) await assert.rejects(call('create', { ...firstRequest, ...request(), article_url: url }), /記事URL/);
  await assert.rejects(call('reply', { ...request(), consent: false, thread_id: thread }), /確認欄/);
});
await test('同じ匿名ブラウザの連投をサーバーで制限する', async () => {
  const hash = actor(55555);
  await call('reply', { ...request(), thread_id: thread }, false, hash);
  await assert.rejects(call('reply', { ...request(), thread_id: thread }, false, hash), /連続した送信/);
});
let fullThread, finalIds;
await test('公開順の20件取得と次ページ、非表示投稿の番号保持・本文の非公開', async () => {
  fullThread = randomUUID();
  await q("insert into forum_private.threads(id,title,category,status,post_count) values($1,'境界テスト','it','published',999)", [fullThread]);
  await q("insert into forum_private.posts(request_id,actor_hash,thread_id,seq,name,body,status) select gen_random_uuid(),$2,$1,n,'テスト','サンプル本文','published' from generate_series(1,999)n", [fullThread, actor(777)]);
  const one = await call('thread', { thread_id: fullThread, after: 0 }); assert.equal(one.posts.length, 20); assert.equal(one.next_after, 20); assert.equal(one.has_more, true);
  const two = await call('thread', { thread_id: fullThread, after: one.next_after }); assert.equal(two.posts[0].seq, 21); assert.equal(two.posts.at(-1).seq, 40);
  const id = (await q('select id from forum_private.posts where thread_id=$1 and seq=1', [fullThread]))[0].id;
  await call('moderate', { decision: 'hide', post_id: id }, true);
  const hidden = (await call('thread', { thread_id: fullThread })).posts[0]; assert.equal(hidden.seq, 1); assert.equal(hidden.hidden, true); assert.equal(hidden.body, ''); assert.equal(hidden.name, '');
  assert.equal((await call('thread', { thread_id: fullThread })).thread.post_count, 999);
  const publicJson = JSON.stringify(one); assert.equal(publicJson.includes('actor_hash'), false); assert.equal(publicJson.includes('receipt'), false);
});
await test('999件で受け付けた2件の承認が競合しても、公開は1000件で止まる', async () => {
  const receipts = await Promise.all([call('reply', { ...request(), thread_id: fullThread }), call('reply', { ...request(), thread_id: fullThread })]);
  finalIds = await q('select id from forum_private.posts where receipt=any($1::uuid[]) order by id', [receipts.map(x => x.receipt)]);
  const outcomes = await Promise.allSettled(finalIds.map(({ id }) => call('moderate', { decision: 'approve', post_id: id }, true)));
  assert.equal(outcomes.filter(x => x.status === 'fulfilled').length, 1); assert.equal(outcomes.filter(x => x.status === 'rejected').length, 1);
  const data = await call('thread', { thread_id: fullThread, after: 980 }); assert.equal(data.thread.post_count, 1000); assert.equal(data.thread.closed, true); assert.equal(data.posts.length, 20); assert.equal(data.posts.at(-1).seq, 1000); assert.equal(data.has_more, false);
  await assert.rejects(call('reply', { ...request(), thread_id: fullThread }), /1,000件/);
});
await test('1001番目の直接書き込みも制約で拒否し、非表示にしても受付枠を増やさない', async () => {
  await assert.rejects(q("insert into forum_private.posts(request_id,actor_hash,thread_id,seq,name,body,status) values(gen_random_uuid(),$2,$1,1001,'テスト','テスト','published')", [fullThread, actor(1)]), /check constraint/);
  const id = (await q('select id from forum_private.posts where thread_id=$1 and seq=1000', [fullThread]))[0].id;
  await call('moderate', { decision: 'hide', post_id: id }, true);
  await assert.rejects(call('reply', { ...request(), thread_id: fullThread }), /1,000件/);
});
await test('続きは満了後だけ受付し、重複を防ぎ、承認後だけ前後のリンクを公開する', async () => {
  await assert.rejects(call('create', { ...firstRequest, ...request(), previous_thread_id: thread }), /1,000件に達してから/);
  const result = await call('create', { ...firstRequest, ...request(), title: '境界テスト（続き）', previous_thread_id: fullThread });
  let parent = await call('thread', { thread_id: fullThread }); assert.equal(parent.thread.continuation_pending, true); assert.equal(parent.thread.next_thread_id, null);
  await assert.rejects(call('create', { ...firstRequest, ...request(), previous_thread_id: fullThread }), /すでに公開済みか確認待ち/);
  const post = (await q('select id,thread_id from forum_private.posts where receipt=$1', [result.receipt]))[0];
  await call('moderate', { decision: 'approve', post_id: post.id }, true);
  parent = await call('thread', { thread_id: fullThread }); assert.equal(parent.thread.next_thread_id, post.thread_id);
  assert.equal((await call('thread', { thread_id: post.thread_id })).thread.previous_thread_id, fullThread);
});
await test('通報は一般閲覧に出ず、管理者の非表示操作で対応済みになる', async () => {
  const reportRequest = { request_id: randomUUID(), thread_id: thread, seq: 2, reason: 'personal' };
  const hash = actor(812345); await call('report', reportRequest, false, hash); await call('report', reportRequest, false, hash);
  const queue = await call('admin_queue', {}, true); assert.equal(queue.reports.length, 1);
  assert.equal(JSON.stringify(await call('thread', { thread_id: thread })).includes('personal'), false);
  await call('moderate', { decision: 'hide', post_id: queue.reports[0].post_id }, true);
  assert.equal((await call('admin_queue', {}, true)).reports.length, 0);
});
await test('一覧の20件取得とカーソルで重複なく続きの1件を取得する', async () => {
  await q("insert into forum_private.threads(title,category,status,post_count) select '一覧テスト'||n,'general','published',1 from generate_series(1,21)n");
  const one = await call('list', { category: 'general' }); assert.equal(one.threads.length, 20); assert.equal(one.has_more, true);
  const two = await call('list', { category: 'general', cursor: one.next_cursor }); assert.equal(two.threads.length, 1); assert.equal(two.has_more, false); assert.equal(one.threads.some(x => x.id === two.threads[0].id), false);
});
await test('スレッド全体の非表示で一覧と個別取得から除外し、確認待ちの受付も終了する', async () => {
  await call('moderate', { decision: 'hide_thread', thread_id: thread }, true);
  await assert.rejects(call('thread', { thread_id: thread }), /公開されていない/);
  assert.equal((await q("select count(*)::int n from forum_private.posts where thread_id=$1 and status='pending'", [thread]))[0].n, 0);
});
await test('全体の受付量にもサーバー側の上限がある', async () => {
  await q('update forum_private.intake_total set window_at=clock_timestamp(),hits=500');
  await assert.rejects(call('create', { ...firstRequest, ...request() }), /混み合っています/);
  await q('update forum_private.intake_total set hits=0');
});
await test('匿名・通常ログインのDB直接取得とRPC直呼びを権限で拒否する', async () => {
  await db.exec('reset role');
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`);
    await assert.rejects(call('admin_queue', {}, true), /permission denied/);
    for (const table of ['threads','posts','reports','intake_limits','intake_total']) {
      const column = ['threads','posts'].includes(table) ? 'status' : table === 'reports' ? 'resolved' : 'hits';
      for (const sql of [`select * from forum_private.${table}`, `insert into forum_private.${table} default values`, `update forum_private.${table} set ${column}=${column}`, `delete from forum_private.${table}`]) {
        await assert.rejects(q(sql), /permission denied/);
      }
    }
    await db.exec('reset role');
  }
  const tables = await q("select relname,relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='forum_private' and c.relkind='r'");
  assert.equal(tables.length, 5); assert.equal(tables.every(t => t.relrowsecurity), true);
  const functions = await q("select prosecdef from pg_proc where proname='forum_dispatch'"); assert.equal(functions[0].prosecdef, false);
});
console.log(JSON.stringify({ environment: 'PGlite 0.5.16 / isolated Postgres WASM; not hosted Supabase', results, limitations: ['PGlite serializes client queries. A multi-connection hosted concurrency test remains necessary; row locks and the count CHECK were exercised here.', 'Hosted RLS/advisors, Edge gateway and real admin Auth are not tested by these local results.'] }, null, 2));
await db.close();
