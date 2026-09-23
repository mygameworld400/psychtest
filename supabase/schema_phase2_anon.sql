-- Phase 2를 "로그인 계정" 대신 지금까지와 같은 익명 모델로 확장한다.
-- 첫 방문 시 닉네임만 입력하면 브라우저에 예측 불가능한 owner_id(UUID)를 저장하고,
-- 그 owner_id를 pt_persons/pt_purchases/pt_invite_links의 소유자 식별자로 그대로 쓴다.
--
-- pt_results/pt_assessments가 이미 "결과 코드를 아는 사람만 접근"으로 동작하는 것과
-- 같은 신뢰 모델이다 — owner_id를 아는 브라우저만 그 사람 데이터에 접근한다.
-- schema_phase2.sql의 to authenticated 정책은 실제 로그인을 쓰기 전까진 그냥 매치되지
-- 않는 죽은 정책이라 지우지 않고 그대로 둬도 안전하다. 여기서는 to anon 정책만 추가한다.
--
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 실행. 여러 번 실행해도 안전하다.

-- ── pt_persons ──────────────────────────────────────────
drop policy if exists "anon insert persons" on pt_persons;
create policy "anon insert persons" on pt_persons for insert to anon with check (true);
drop policy if exists "anon read persons" on pt_persons;
create policy "anon read persons" on pt_persons for select to anon using (true);
drop policy if exists "anon update persons" on pt_persons;
create policy "anon update persons" on pt_persons for update to anon using (true);
drop policy if exists "anon delete persons" on pt_persons;
create policy "anon delete persons" on pt_persons for delete to anon using (true);

-- ── pt_relationships ────────────────────────────────────
drop policy if exists "anon insert relationships" on pt_relationships;
create policy "anon insert relationships" on pt_relationships for insert to anon with check (true);
drop policy if exists "anon read relationships" on pt_relationships;
create policy "anon read relationships" on pt_relationships for select to anon using (true);
drop policy if exists "anon delete relationships" on pt_relationships;
create policy "anon delete relationships" on pt_relationships for delete to anon using (true);

-- ── pt_purchases ────────────────────────────────────────
drop policy if exists "anon insert purchases" on pt_purchases;
create policy "anon insert purchases" on pt_purchases for insert to anon with check (true);
drop policy if exists "anon read purchases" on pt_purchases;
create policy "anon read purchases" on pt_purchases for select to anon using (true);

-- ── pt_invite_links ─────────────────────────────────────
-- resolve_invite()/mark_invite_used()는 이미 security definer라 RLS와 무관하게 동작한다.
-- 여기서는 "초대를 만든 사람이 자기 초대 목록을 보는" 용도의 정책만 추가한다.
drop policy if exists "anon insert invites" on pt_invite_links;
create policy "anon insert invites" on pt_invite_links for insert to anon with check (true);
drop policy if exists "anon read invites" on pt_invite_links;
create policy "anon read invites" on pt_invite_links for select to anon using (true);
drop policy if exists "anon update invites" on pt_invite_links;
create policy "anon update invites" on pt_invite_links for update to anon using (true);

-- ── pt_assessments: 누구 소유인지 태깅 ──────────────────
-- "내 리포트함"에서 로그인 없이도 내가 만든 결과 목록을 서버에서 다시 불러올 수 있게
-- owner_id 컬럼을 추가한다. 기존 select/insert/update 정책은 이미 anon 전체 허용이라
-- 그대로 쓴다.
alter table pt_assessments add column if not exists owner_id uuid;
