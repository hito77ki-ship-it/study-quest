// No third-party dependencies or new secret provisioning. Hosted credentials stay in Deno's environment.
const ALLOWED_ORIGIN = 'https://study-quest.net';
const PUBLIC_ACTIONS = new Set(['list', 'thread', 'create', 'reply', 'report']);
const ADMIN_ACTIONS = new Set(['admin_queue', 'moderate']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function handle(req: Request, env: (name: string) => string | undefined, transport: typeof fetch = fetch): Promise<Response> {
  const cors = { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Access-Control-Allow-Headers': 'authorization,apikey,content-type', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Vary': 'Origin' };
  const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  const origin = req.headers.get('origin');
  if (origin && origin !== ALLOWED_ORIGIN) return response({ error: 'この送信元からは利用できません。' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return response({ error: '送信方法を確認してください。' }, 405);
  const url = env('SUPABASE_URL'), secret = env('SUPABASE_SERVICE_ROLE_KEY'), anon = env('SUPABASE_ANON_KEY');
  if (!url || !secret || !anon) return response({ error: '受付を利用できません。時間をおいてお試しください。' }, 503);
  // The deployed gateway keeps verify_jwt=true. The public, existing anon JWT is
  // used for anonymous intake; admin actions additionally require a real admin user.
  if (req.headers.get('apikey') !== anon) return response({ error: '接続を確認してください。' }, 401);
  let body: { action?: string; payload?: Record<string, unknown>; visitor_id?: string };
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) return response({ error: '送信形式を確認してください。' }, 415);
    if (Number(req.headers.get('content-length') || 0) > 16384) return response({ error: '送信内容が長すぎます。' }, 413);
    // Bound the stream as well; Content-Length is optional and untrusted.
    if (!req.body) return response({ error: '送信内容を確認してください。' }, 400);
    const reader = req.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 16384) { await reader.cancel(); return response({ error: '送信内容が長すぎます。' }, 413); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body) || !body.payload || typeof body.payload !== 'object' || Array.isArray(body.payload)) throw new Error('invalid');
  } catch { return response({ error: '送信内容を確認してください。' }, 400); }
  const action = String(body.action || '');
  if (!PUBLIC_ACTIONS.has(action) && !ADMIN_ACTIONS.has(action)) return response({ error: '操作を確認してください。' }, 400);
  let isAdmin = false;
  if (ADMIN_ACTIONS.has(action)) {
    const authorization = req.headers.get('authorization') || '';
    if (!authorization.startsWith('Bearer ') || authorization === `Bearer ${anon}`) return response({ error: '管理者のログインが必要です。' }, 401);
    try {
      const user = await transport(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: authorization }, signal: AbortSignal.timeout(8000) });
      const data = await user.json();
      if (!user.ok || !data.id) return response({ error: '管理者のログインを確認してください。' }, 401);
      const check = await transport(`${url}/rest/v1/rpc/is_admin`, { method: 'POST', headers: { apikey: anon, Authorization: authorization, 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(8000) });
      isAdmin = check.ok && (await check.json()) === true;
      if (!isAdmin) return response({ error: '管理者権限が必要です。' }, 403);
    } catch { return response({ error: '管理者の権限を確認できませんでした。' }, 503); }
  }
  if (!body.visitor_id || !UUID.test(body.visitor_id)) return response({ error: '受付用の識別子を確認できませんでした。' }, 400);
  // Rate limiting is browser based, not proof of identity. No IP, email, account
  // name, or raw browser identifier is stored by this handler. Global/pending
  // quotas and pre-publication moderation are also enforced in the database.
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`forum:${body.visitor_id}`));
  const actorHash = [...new Uint8Array(signature)].map(x => x.toString(16).padStart(2, '0')).join('');
  try {
    const result = await transport(`${url}/rest/v1/rpc/forum_dispatch`, {
      method: 'POST', headers: { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_action: action, p_payload: body.payload, p_actor_hash: actorHash, p_is_admin: isAdmin }), signal: AbortSignal.timeout(10000)
    });
    const data = await result.json();
    if (!result.ok) {
      // Expected Japanese validation messages only; never expose SQL details or credentials.
      const friendly = typeof data.message === 'string' && /[ぁ-んァ-ヶ一-龠]/u.test(data.message) ? data.message : '受付を確認できませんでした。入力を残したまま、時間をおいてお試しください。';
      return response({ error: friendly }, data.code === '42501' ? 403 : 400);
    }
    return response(data);
  } catch { return response({ error: '通信の結果を確認できませんでした。同じ受付番号で再確認してください。' }, 503); }
}

if (import.meta.main) Deno.serve((req: Request) => handle(req, name => Deno.env.get(name)));
