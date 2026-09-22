-- psychtest 테이블. 다른 프로젝트(mh_)와 같은 Supabase 프로젝트를 공유하므로
-- pt_ 접두사로 구분한다.

create table if not exists pt_results (
  id text primary key,
  test_slug text not null,
  result_type text,
  answers jsonb not null default '[]',
  ai_analysis text,
  created_at timestamptz not null default now()
);

-- MBTI식 결과(result_type)와 AI 장문 분석(ai_analysis)은 테스트 종류에 따라
-- 둘 중 하나만 채워진다.
alter table pt_results add column if not exists ai_analysis text;
alter table pt_results alter column result_type drop not null;

alter table pt_results enable row level security;

-- 로그인 없는 공개 사이트: 누구나 결과를 만들고(insert), 결과 코드로 읽을 수 있다(select).
-- id는 예측 불가능한 랜덤 문자열이라 URL을 아는 사람만 접근한다.
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 실행. 여러 번 실행해도 안전하다.
drop policy if exists "anon insert results" on pt_results;
create policy "anon insert results" on pt_results
  for insert to anon
  with check (true);

drop policy if exists "anon read results" on pt_results;
create policy "anon read results" on pt_results
  for select to anon
  using (true);
