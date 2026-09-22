-- Phase 2 — 계정(Supabase Auth) + 사람 추가 + 초대 링크.
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 실행. 여러 번 실행해도 안전하다.

-- pt_persons: 로그인한 소유자만 자기 사람 목록을 만들고 읽는다.
drop policy if exists "owner insert persons" on pt_persons;
create policy "owner insert persons" on pt_persons
  for insert to authenticated with check (auth.uid() = owner_user_id);

drop policy if exists "owner read persons" on pt_persons;
create policy "owner read persons" on pt_persons
  for select to authenticated using (auth.uid() = owner_user_id);

drop policy if exists "owner update persons" on pt_persons;
create policy "owner update persons" on pt_persons
  for update to authenticated using (auth.uid() = owner_user_id);

drop policy if exists "owner delete persons" on pt_persons;
create policy "owner delete persons" on pt_persons
  for delete to authenticated using (auth.uid() = owner_user_id);

-- pt_invite_links: 마찬가지로 소유자만 만들고 읽는다. 초대받은 사람(비로그인)은
-- 아래 resolve_invite() 함수로만 필요한 최소 정보(사람 이름/유효기간)를 얻는다 —
-- 테이블을 직접 열람할 필요가 없다.
drop policy if exists "owner insert invites" on pt_invite_links;
create policy "owner insert invites" on pt_invite_links
  for insert to authenticated with check (auth.uid() = owner_user_id);

drop policy if exists "owner read invites" on pt_invite_links;
create policy "owner read invites" on pt_invite_links
  for select to authenticated using (auth.uid() = owner_user_id);

drop policy if exists "owner update invites" on pt_invite_links;
create policy "owner update invites" on pt_invite_links
  for update to authenticated using (auth.uid() = owner_user_id);

-- 초대 코드로 사람 이름 + 유효성만 확인한다 (테이블 직접 노출 없이).
create or replace function resolve_invite(p_token text)
returns table (person_id uuid, display_name text, relationship_label text, expires_at timestamptz, used_at timestamptz)
language sql security definer set search_path = public as $$
  select p.id, p.display_name, p.relationship_label, i.expires_at, i.used_at
  from pt_invite_links i
  join pt_persons p on p.id = i.person_id
  where i.token = p_token
$$;

grant execute on function resolve_invite(text) to anon, authenticated;

-- 초대받은 사람이 테스트를 끝내면 호출해서 링크를 "사용됨"으로 표시한다.
create or replace function mark_invite_used(p_token text)
returns void
language sql security definer set search_path = public as $$
  update pt_invite_links set used_at = now() where token = p_token and used_at is null;
$$;

grant execute on function mark_invite_used(text) to anon, authenticated;

-- pt_assessments를 person_id로 조회할 때 필요 (Phase 1 정책은 전체 anon read라 이미 가능하지만,
-- person_id에 대한 소유자 필터링은 클라이언트에서 pt_persons를 먼저 읽어 확인한다).
