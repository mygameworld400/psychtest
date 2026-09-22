-- 연인 심리·관계 분석 스펙 — 전체 엔티티 스키마.
-- Phase 1(ME)에서 실제로 쓰는 건 pt_assessments / pt_responses / pt_computed_scores /
-- pt_reports 뿐이다. 나머지(persons/relationships/purchases/invite_links)는
-- Phase 2~6에서 쓸 것을 미리 만들어두되, 지금은 RLS를 막아 비활성 상태로 둔다.
--
-- 로그인(Supabase Auth)은 Phase 2부터 붙인다. 그래서 owner_user_id는 전부 nullable —
-- Phase 1은 지금 psychtest와 같은 "결과 코드로 공유" 익명 모델로 동작한다.
--
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 실행. 여러 번 실행해도 안전하다.

create table if not exists pt_persons (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid,
  display_name text not null,
  relationship_label text,
  response_mode text not null default 'self' check (response_mode in ('self', 'direct', 'observed')),
  created_at timestamptz not null default now()
);

create table if not exists pt_relationships (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid,
  person_a_id uuid references pt_persons(id) on delete cascade,
  person_b_id uuid references pt_persons(id) on delete cascade,
  relation_type text,
  created_at timestamptz not null default now()
);

create table if not exists pt_assessments (
  id text primary key,
  person_id uuid references pt_persons(id) on delete set null,
  product_type text not null check (product_type in ('ME', 'PAIR', 'NOW', 'AFTER')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  question_version text not null,
  scoring_version text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists pt_responses (
  id bigint generated always as identity primary key,
  assessment_id text not null references pt_assessments(id) on delete cascade,
  question_id text not null,
  numeric_value smallint,
  option_id text,
  free_text text,
  created_at timestamptz not null default now()
);

create table if not exists pt_computed_scores (
  id bigint generated always as identity primary key,
  assessment_id text not null references pt_assessments(id) on delete cascade,
  dimension_key text not null,
  raw_score numeric,
  normalized_score numeric,
  confidence numeric,
  created_at timestamptz not null default now()
);

create table if not exists pt_reports (
  id bigint generated always as identity primary key,
  assessment_id text not null references pt_assessments(id) on delete cascade,
  report_type text not null,
  summary_json jsonb not null default '{}',
  generated_at timestamptz not null default now()
);

create table if not exists pt_purchases (
  id bigint generated always as identity primary key,
  user_id uuid,
  product_sku text not null,
  amount integer not null,
  currency text not null default 'KRW',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists pt_invite_links (
  id bigint generated always as identity primary key,
  owner_user_id uuid,
  person_id uuid references pt_persons(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── RLS ─────────────────────────────────────────────────────────
alter table pt_persons enable row level security;
alter table pt_relationships enable row level security;
alter table pt_assessments enable row level security;
alter table pt_responses enable row level security;
alter table pt_computed_scores enable row level security;
alter table pt_reports enable row level security;
alter table pt_purchases enable row level security;
alter table pt_invite_links enable row level security;

-- Phase 1(ME)은 로그인 없이 익명으로 만들고 읽는다. 결과 id는 예측 불가능한
-- 랜덤 문자열이라 URL/코드를 아는 사람만 접근한다. persons/relationships는
-- ME 단계에서 쓰지 않으므로 정책을 만들지 않는다(RLS만 켜서 기본 차단).

drop policy if exists "anon insert assessments" on pt_assessments;
create policy "anon insert assessments" on pt_assessments for insert to anon with check (true);
drop policy if exists "anon read assessments" on pt_assessments;
create policy "anon read assessments" on pt_assessments for select to anon using (true);
drop policy if exists "anon update assessments" on pt_assessments;
create policy "anon update assessments" on pt_assessments for update to anon using (true);

drop policy if exists "anon insert responses" on pt_responses;
create policy "anon insert responses" on pt_responses for insert to anon with check (true);
drop policy if exists "anon read responses" on pt_responses;
create policy "anon read responses" on pt_responses for select to anon using (true);

drop policy if exists "anon insert scores" on pt_computed_scores;
create policy "anon insert scores" on pt_computed_scores for insert to anon with check (true);
drop policy if exists "anon read scores" on pt_computed_scores;
create policy "anon read scores" on pt_computed_scores for select to anon using (true);

drop policy if exists "anon insert reports" on pt_reports;
create policy "anon insert reports" on pt_reports for insert to anon with check (true);
drop policy if exists "anon read reports" on pt_reports;
create policy "anon read reports" on pt_reports for select to anon using (true);
