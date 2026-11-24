-- Proposed additive schema. Apply only after the owner approves the hosted addition.
-- No existing application table, Auth setting, account, or record is changed.
begin;
create schema forum_private;
revoke all on schema forum_private from public, anon, authenticated;
grant usage on schema forum_private to service_role;

create table forum_private.threads (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  category text not null check (category in ('boki','it','general')),
  article_url text not null default '' check (article_url = '' or article_url ~ '^https://study-quest\.net/[a-z0-9-]+\.html$'),
  status text not null default 'pending' check (status in ('pending','published','hidden')),
  post_count integer not null default 0 check (post_count between 0 and 1000),
  previous_thread_id uuid references forum_private.threads(id),
  next_thread_id uuid references forum_private.threads(id),
  created_at timestamptz not null default now()
);
create unique index forum_one_continuation on forum_private.threads(previous_thread_id)
  where previous_thread_id is not null and status <> 'hidden';
create index forum_threads_page on forum_private.threads(created_at desc, id desc) where status='published';
create table forum_private.posts (
  id uuid primary key default gen_random_uuid(),
  receipt uuid not null unique default gen_random_uuid(),
  request_id uuid not null unique,
  actor_hash text not null,
  thread_id uuid not null references forum_private.threads(id),
  seq integer check (seq between 1 and 1000),
  name text not null check (char_length(btrim(name)) between 1 and 20),
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  reply_to integer check (reply_to between 1 and 1000),
  status text not null default 'pending' check (status in ('pending','published','hidden','rejected')),
  created_at timestamptz not null default now(),
  unique(thread_id, seq),
  check ((status in ('pending','rejected') and seq is null) or (status in ('published','hidden') and seq is not null))
);
create index forum_posts_page on forum_private.posts(thread_id,seq) where seq is not null;
create index forum_pending on forum_private.posts(created_at,id) where status='pending';
create table forum_private.reports (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  actor_hash text not null,
  post_id uuid not null references forum_private.posts(id),
  reason text not null check (reason in ('personal','abuse','copyright','other')),
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  unique(actor_hash,post_id)
);
create index forum_reports_pending on forum_private.reports(created_at,id) where not resolved;
create table forum_private.intake_limits (
  actor_hash text primary key,
  window_at timestamptz not null,
  last_at timestamptz not null,
  hits integer not null
);
create table forum_private.intake_total (
  singleton boolean primary key default true check(singleton),
  window_at timestamptz not null,
  hits integer not null
);
insert into forum_private.intake_total values (true,now(),0);

alter table forum_private.threads enable row level security;
alter table forum_private.posts enable row level security;
alter table forum_private.reports enable row level security;
alter table forum_private.intake_limits enable row level security;
alter table forum_private.intake_total enable row level security;
create policy forum_threads_service on forum_private.threads to service_role using(true) with check(true);
create policy forum_posts_service on forum_private.posts to service_role using(true) with check(true);
create policy forum_reports_service on forum_private.reports to service_role using(true) with check(true);
create policy forum_limits_service on forum_private.intake_limits to service_role using(true) with check(true);
create policy forum_total_service on forum_private.intake_total to service_role using(true) with check(true);
revoke all on all tables in schema forum_private from public,anon,authenticated;
grant select,insert,update,delete on all tables in schema forum_private to service_role;

-- Invoker functions only. No SECURITY DEFINER / public write policies.
-- The Edge Function is the sole caller and independently checks real admin sessions.
create function public.forum_dispatch(p_action text,p_payload jsonb,p_actor_hash text default '',p_is_admin boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  t forum_private.threads%rowtype;
  p forum_private.posts%rowtype;
  lim forum_private.intake_limits%rowtype;
  total forum_private.intake_total%rowtype;
  v_thread uuid;
  v_previous uuid;
  v_request uuid;
  v_receipt uuid;
  v_after integer;
  v_last integer;
  v_seq integer;
  v_reply integer;
  v_name text;
  v_body text;
  v_title text;
  v_category text;
  v_url text;
  v_decision text;
  v_list jsonb;
  v_has_more boolean;
  v_cursor uuid;
  v_post uuid;
begin
  if current_user not in ('service_role','postgres') then
    raise exception 'この操作は公開APIからは呼び出せません。' using errcode='42501';
  end if;
  if p_action='list' then
    v_category:=coalesce(p_payload->>'category','');
    if v_category not in ('','boki','it','general') then raise exception '分野を確認してください。'; end if;
    v_cursor:=(p_payload->>'cursor')::uuid;
    if v_cursor is not null and not exists(select 1 from forum_private.threads where id=v_cursor and status='published') then raise exception '一覧を最初から読み直してください。'; end if;
    with page as (
      select id,title,category,post_count,created_at,post_count>=1000 as closed
      from forum_private.threads
      where status='published' and (v_category='' or category=v_category)
      and (v_cursor is null or (created_at,id)<(select created_at,id from forum_private.threads where id=v_cursor))
      order by created_at desc,id desc limit 21
    ), displayed as (select * from page order by created_at desc,id desc limit 20)
    select coalesce(jsonb_agg(to_jsonb(d) order by created_at desc,id desc),'[]'::jsonb),
      (select count(*)>20 from page),
      (select id from displayed order by created_at,id limit 1)
    into v_list,v_has_more,v_cursor from displayed d;
    return jsonb_build_object('threads',v_list,'has_more',v_has_more,'next_cursor',v_cursor);
  elsif p_action='thread' then
    v_thread:=(p_payload->>'thread_id')::uuid;
    v_after:=coalesce((p_payload->>'after')::integer,0);
    if v_after<0 or v_after>980 or v_after%20<>0 then raise exception '表示する投稿番号を確認してください。'; end if;
    select * into t from forum_private.threads where id=v_thread and status='published';
    if not found then raise exception 'このスレッドは公開されていないか、見つかりません。'; end if;
    select coalesce(jsonb_agg(jsonb_build_object(
      'seq',q.seq,'name',case when q.status='hidden' then '' else q.name end,
      'body',case when q.status='hidden' then '' else q.body end,
      'hidden',q.status='hidden','reply_to',q.reply_to,'created_at',q.created_at
    ) order by q.seq),'[]'::jsonb),coalesce(max(q.seq),v_after)
    into v_list,v_last from (select * from forum_private.posts where thread_id=v_thread and seq>v_after order by seq limit 20) q;
    return jsonb_build_object('thread',jsonb_build_object(
      'id',t.id,'title',t.title,'category',t.category,'article_url',t.article_url,'post_count',t.post_count,'closed',t.post_count>=1000,
      'next_thread_id',(select id from forum_private.threads where id=t.next_thread_id and status='published'),
      'previous_thread_id',(select id from forum_private.threads where id=t.previous_thread_id and status='published'),
      'continuation_pending',exists(select 1 from forum_private.threads where previous_thread_id=t.id and status='pending')
    ),'posts',v_list,'next_after',v_last,'has_more',v_last<t.post_count);
  elsif p_action in ('admin_queue','moderate') then
    if not p_is_admin then raise exception '管理者のログインが必要です。' using errcode='42501'; end if;
    if p_action='admin_queue' then
      select coalesce(jsonb_agg(to_jsonb(q) order by q.created_at),'[]'::jsonb) into v_list from (
        select ps.id,ps.thread_id,ps.name,ps.body,ps.reply_to,ps.created_at,th.title,th.category,th.post_count,th.status as thread_status
        from forum_private.posts ps join forum_private.threads th on th.id=ps.thread_id
        where ps.status='pending' order by ps.created_at,ps.id limit 20
      ) q;
      return jsonb_build_object('pending',v_list,'pending_count',(select count(*) from forum_private.posts where status='pending'),
        'reports',(select coalesce(jsonb_agg(to_jsonb(q) order by q.created_at),'[]'::jsonb) from (
          select r.id,r.reason,r.created_at,ps.id as post_id,ps.thread_id,ps.seq,ps.name,ps.body,ps.status,th.title
          from forum_private.reports r join forum_private.posts ps on ps.id=r.post_id join forum_private.threads th on th.id=ps.thread_id
          where not r.resolved order by r.created_at,r.id limit 20
        ) q));
    end if;
    v_decision:=p_payload->>'decision';
    if v_decision='dismiss_report' then
      update forum_private.reports set resolved=true where id=(p_payload->>'report_id')::uuid;
      return jsonb_build_object('status','updated');
    end if;
    if v_decision='hide_thread' then
      select * into t from forum_private.threads where id=(p_payload->>'thread_id')::uuid for update;
      if not found then raise exception 'スレッドが見つかりません。'; end if;
      update forum_private.threads set status='hidden' where id=t.id;
      update forum_private.posts set status='rejected' where thread_id=t.id and status='pending';
      return jsonb_build_object('status','updated');
    end if;
    v_post:=(p_payload->>'post_id')::uuid;
    -- Always lock the thread before its post. Concurrent approvals share this order.
    select * into t from forum_private.threads where id=(select thread_id from forum_private.posts where id=v_post) for update;
    select * into p from forum_private.posts where id=v_post for update;
    if not found then raise exception '投稿が見つかりません。'; end if;
    if v_decision='approve' then
      if p.status='published' then return jsonb_build_object('status','updated','seq',p.seq); end if;
      if p.status<>'pending' or t.status='hidden' then raise exception '公開できる確認待ち投稿ではありません。'; end if;
      if t.post_count>=1000 then raise exception '1,000件に達したため公開できません。確認待ちの投稿を非公開にしてください。'; end if;
      v_seq:=t.post_count+1;
      update forum_private.posts set status='published',seq=v_seq where id=p.id;
      update forum_private.threads set status='published',post_count=v_seq where id=t.id;
      if t.previous_thread_id is not null then
        update forum_private.threads set next_thread_id=t.id where id=t.previous_thread_id;
      end if;
      return jsonb_build_object('status','updated','seq',v_seq);
    elsif v_decision='reject' then
      if p.status<>'pending' then raise exception '確認待ちの投稿だけを非公開にできます。'; end if;
      update forum_private.posts set status='rejected' where id=p.id;
      if t.post_count=0 then update forum_private.threads set status='hidden' where id=t.id; end if;
    elsif v_decision='hide' then
      if p.status<>'published' then raise exception '公開中の投稿だけを非表示にできます。'; end if;
      update forum_private.posts set status='hidden' where id=p.id;
      update forum_private.reports set resolved=true where post_id=p.id;
    else raise exception '操作を確認してください。';
    end if;
    return jsonb_build_object('status','updated');
  elsif p_action not in ('create','reply','report') then
    raise exception '操作を確認してください。';
  end if;

  if p_actor_hash is null or p_actor_hash !~ '^[0-9a-f]{64}$' then raise exception '受付用の識別子を確認できませんでした。'; end if;
  v_request:=(p_payload->>'request_id')::uuid;
  if v_request is null then raise exception '受付番号を確認できませんでした。'; end if;
  -- Serializes only intake validation/quota updates; no network or external work in lock.
  perform pg_advisory_xact_lock(hashtext('study-quest-learning-forum-intake'));
  if p_action in ('create','reply') then
    select * into p from forum_private.posts where request_id=v_request;
    if found then
      if p.actor_hash<>p_actor_hash then raise exception '同じ受付番号を照合できませんでした。'; end if;
      return jsonb_build_object('status',p.status,'receipt',p.receipt);
    end if;
    if (p_payload->>'consent') is distinct from 'true' then raise exception '公開についての確認欄にチェックしてください。'; end if;
    v_name:=coalesce(nullif(btrim(p_payload->>'name'),''),'名無しさん'); v_body:=btrim(p_payload->>'body', E' \t\r\n　');
    if char_length(v_name)>20 or v_body is null or char_length(v_body) not between 1 and 1000 then raise exception '名前は20文字以内、本文は1〜1,000文字で入力してください。'; end if;
    if (select count(*) from forum_private.posts where status='pending')>=200 then raise exception '現在、投稿受付が混み合っています。時間をおいてお試しください。'; end if;
  else
    if exists(select 1 from forum_private.reports where request_id=v_request and actor_hash=p_actor_hash) then return jsonb_build_object('status','received'); end if;
    if p_payload->>'reason' not in ('personal','abuse','copyright','other') or p_payload->>'reason' is null then raise exception '通報理由を確認してください。'; end if;
    if (select count(*) from forum_private.reports where not resolved)>=200 then raise exception '現在、受付が混み合っています。時間をおいてお試しください。'; end if;
  end if;
  select * into lim from forum_private.intake_limits where actor_hash=p_actor_hash for update;
  if found and (lim.last_at>clock_timestamp()-interval '30 seconds' or (lim.window_at>clock_timestamp()-interval '10 minutes' and lim.hits>=5)) then
    raise exception '連続した送信を制限しています。少し時間をおいてお試しください。';
  end if;
  select * into total from forum_private.intake_total where singleton=true for update;
  if total.window_at>clock_timestamp()-interval '1 hour' and total.hits>=500 then raise exception '現在、受付が混み合っています。時間をおいてお試しください。'; end if;

  if p_action='create' then
    v_title:=btrim(p_payload->>'title');v_category:=p_payload->>'category';v_url:=coalesce(p_payload->>'article_url','');
    if v_title is null or char_length(v_title) not between 1 and 80 or v_category is null or v_category not in ('boki','it','general') then raise exception 'タイトルと分野を確認してください。'; end if;
    if v_url<>'' and v_url !~ '^https://study-quest\.net/[a-z0-9-]+\.html$' then raise exception '関連する記事にはStudy Questの記事URLを入力してください。'; end if;
    v_previous:=(p_payload->>'previous_thread_id')::uuid;
    if v_previous is not null then
      select * into t from forum_private.threads where id=v_previous and status='published' for update;
      if not found or t.post_count<1000 then raise exception '続きのスレッドは1,000件に達してから作れます。'; end if;
      if exists(select 1 from forum_private.threads where previous_thread_id=t.id and status<>'hidden') then raise exception '続きのスレッドはすでに公開済みか確認待ちです。'; end if;
    end if;
    insert into forum_private.threads(title,category,article_url,previous_thread_id) values(v_title,v_category,v_url,v_previous) returning id into v_thread;
  else
    v_thread:=(p_payload->>'thread_id')::uuid;
    select * into t from forum_private.threads where id=v_thread and status='published' for update;
    if not found then raise exception 'このスレッドは公開されていないか、見つかりません。'; end if;
    if p_action='reply' and t.post_count>=1000 then raise exception '1,000件に達したため、このスレッドへの投稿受付は終了しました。'; end if;
    if p_action='reply' then
      v_reply:=(p_payload->>'reply_to')::integer;
      if v_reply is not null and not exists(select 1 from forum_private.posts where thread_id=t.id and seq=v_reply and status='published') then raise exception '返信先の投稿を確認してください。'; end if;
      if (select count(*) from forum_private.posts where thread_id=t.id and status='pending')>=50 then raise exception 'このスレッドの確認待ち投稿が多いため、時間をおいてお試しください。'; end if;
    else
      select * into p from forum_private.posts where thread_id=t.id and seq=(p_payload->>'seq')::integer and status='published';
      if not found then raise exception '対象の投稿を確認してください。'; end if;
      if exists(select 1 from forum_private.reports where post_id=p.id and actor_hash=p_actor_hash) then return jsonb_build_object('status','received'); end if;
    end if;
  end if;
  insert into forum_private.intake_limits as l(actor_hash,window_at,last_at,hits) values(p_actor_hash,clock_timestamp(),clock_timestamp(),1)
  on conflict(actor_hash) do update set
    hits=case when l.window_at>clock_timestamp()-interval '10 minutes' then l.hits+1 else 1 end,
    window_at=case when l.window_at>clock_timestamp()-interval '10 minutes' then l.window_at else clock_timestamp() end,last_at=clock_timestamp();
  update forum_private.intake_total set hits=case when window_at>clock_timestamp()-interval '1 hour' then hits+1 else 1 end,
    window_at=case when window_at>clock_timestamp()-interval '1 hour' then window_at else clock_timestamp() end where singleton=true;
  -- Retain only short-lived, non-public hashes for the new forum's intake control.
  delete from forum_private.intake_limits where last_at<clock_timestamp()-interval '1 day';
  if p_action='report' then
    insert into forum_private.reports(request_id,actor_hash,post_id,reason) values(v_request,p_actor_hash,p.id,p_payload->>'reason');
    return jsonb_build_object('status','received');
  end if;
  insert into forum_private.posts(request_id,actor_hash,thread_id,name,body,reply_to)
  values(v_request,p_actor_hash,v_thread,v_name,v_body,v_reply) returning receipt into v_receipt;
  return jsonb_build_object('status','pending','receipt',v_receipt);
end;
$$;
revoke all on function public.forum_dispatch(text,jsonb,text,boolean) from public,anon,authenticated;
grant execute on function public.forum_dispatch(text,jsonb,text,boolean) to service_role;
commit;
