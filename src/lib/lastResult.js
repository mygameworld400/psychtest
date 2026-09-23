// 로그인이 없으니 "내가 완료한 결과 목록"은 이 브라우저에 로컬로 남긴다.
// 서버에는 submitAssessment가 owner_id를 같이 저장해두니, 나중에 실제 로그인을
// 붙이면 이 캐시 대신 서버 조회(owner_id 기준)로 그대로 바꿀 수 있다.

const KEY = 'pt_my_results'

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

/** entry: { id, productType, completedAt, label? } */
export function rememberResult(entry) {
  const list = load().filter((e) => e.id !== entry.id)
  list.unshift({ ...entry, completedAt: entry.completedAt || new Date().toISOString() })
  save(list.slice(0, 50))
}

export function listResults(productType) {
  const list = load()
  return productType ? list.filter((e) => e.productType === productType) : list
}

export function latestResult(productType) {
  return listResults(productType)[0] || null
}
