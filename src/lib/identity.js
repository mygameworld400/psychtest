// 계정 없는 익명 신원. 첫 방문에 닉네임을 받으면 예측 불가능한 owner_id(UUID)를
// 브라우저에 저장하고, 그 owner_id를 pt_persons/pt_purchases/pt_invite_links의
// 소유자 식별자로 그대로 쓴다. 나중에 실제 로그인(이메일)으로 바꿀 땐 이 파일만
// auth.uid() 기반으로 교체하면 된다 — 나머지 코드는 getOwnerId()만 호출한다.

const OWNER_KEY = 'pt_owner_id'
const NICK_KEY = 'pt_nickname'
const ADMIN_KEY = 'pt_is_admin'

// 실제 서버 인증이 아니라 관리자 화면을 숨겨두는 클라이언트 레벨 게이트다.
// 이 사이트는 정적 배포라 번들에 들어간 값은 누구나 볼 수 있다 — 민감한 데이터 접근
// 제어에 기대지 말 것.
const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || 'psychtest-admin'

export function getOwnerId() {
  let id = localStorage.getItem(OWNER_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(OWNER_KEY, id)
  }
  return id
}

export function getNickname() {
  return localStorage.getItem(NICK_KEY) || ''
}

export function setNickname(name) {
  localStorage.setItem(NICK_KEY, name.trim())
  getOwnerId()
}

export function hasNickname() {
  return !!getNickname()
}

export function tryAdminLogin(code) {
  const ok = code.trim() === ADMIN_CODE && ADMIN_CODE !== ''
  if (ok) sessionStorage.setItem(ADMIN_KEY, '1')
  return ok
}

export function isAdmin() {
  return sessionStorage.getItem(ADMIN_KEY) === '1'
}
