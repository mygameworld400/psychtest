// 마스터 스펙 7장 PAIR 궁합 계산 규칙 그대로 구현한다.
// - 유사성 지표: similarity = 100 - |A-B|
// - 보완성 지표: 무조건 비슷하다고 좋은 게 아니라 간격 20~45이 최적구간
// - 위험 신호: 정해진 두 극단 조합이 겹치면 별도 충돌 문구를 띄운다

// PAIR 결과의 12개 궁합 카테고리. similarity(비슷할수록 좋음)와
// complement(적당히 다를 때가 최적)를 카테고리별로 나눠 쭉 나열한다 —
// CRUSH도 이 리스트를 그대로 재사용한다(computePair를 N번 부르기만 하면 됨).
export const PAIR_CATEGORIES = [
  { category: '연락 궁합', kind: 'similarity', dims: ['연락욕구'] },
  { category: '개인공간 궁합', kind: 'similarity', dims: ['개인공간욕구', '사생활존중'] },
  { category: '감정 궁합', kind: 'similarity', dims: ['감정공감욕구', '정서의존', '감정표현성'] },
  { category: '신뢰 기준 궁합', kind: 'similarity', dims: ['신뢰초기값', '투명성요구', '질투민감도'] },
  { category: '갈등 해결 궁합', kind: 'complement', dims: ['즉시해결욕구', '갈등후회복속도'] },
  { category: '사랑표현 궁합', kind: 'similarity', dims: ['사랑표현_말', '사랑표현_시간', '사랑표현_스킨십'] },
  { category: '생활 리듬 궁합', kind: 'complement', dims: ['계획성', '즉흥성'] },
  { category: '돈·소비 가치관', kind: 'similarity', dims: ['소비성향', '저축성향'] },
  { category: '미래 가치관', kind: 'similarity', dims: ['결혼의향', '자녀의향', '장기계획일치욕구'] },
  { category: '주도권·의사결정', kind: 'complement', dims: ['주도권욕구', '통제욕구'] },
  { category: '관계 회복력', kind: 'similarity', dims: ['용서성', '관계회복지향', '유연성'] },
]

export const SIMILARITY_DIMENSIONS = PAIR_CATEGORIES.filter((c) => c.kind === 'similarity').flatMap((c) => c.dims)
export const COMPLEMENT_DIMENSIONS = PAIR_CATEGORIES.filter((c) => c.kind === 'complement').flatMap((c) => c.dims)

function categoryOf(dim) {
  return PAIR_CATEGORIES.find((c) => c.dims.includes(dim))?.category ?? dim
}

const RISK_RULES = [
  {
    a: '즉시해결욕구',
    b: '냉각시간욕구',
    threshold: 90,
    label: '추격-회피 충돌',
    detail: '한 명은 갈등을 그 자리에서 풀고 싶어 하고, 다른 한 명은 혼자 정리할 시간이 필요해요. 한 명이 계속 대화를 요구할수록 다른 한 명은 더 멀어질 수 있어요.',
  },
  {
    a: '투명성요구',
    b: '사생활존중',
    threshold: 90,
    label: '사생활 경계 충돌',
    detail: '한 명은 투명하게 공유하는 걸 신뢰의 증거로 보고, 다른 한 명은 공유 없이도 사생활이 존중되길 바라요. 이 기준 차이에서 반복적으로 부딪힐 수 있어요.',
  },
  {
    a: '통제욕구',
    b: '자율성',
    threshold: 85,
    label: '자율권 충돌',
    detail: '한 명은 중요한 결정을 주도하고 싶어 하고, 다른 한 명은 스스로 정하는 영역을 지키고 싶어 해요. 결정권을 두고 반복적으로 신경전이 생길 수 있어요.',
  },
  {
    a: '소비성향',
    b: '저축성향',
    threshold: 85,
    label: '경제 갈등',
    detail: '한 명은 지금의 행복을 위해 쓰는 걸 중요하게 보고, 다른 한 명은 미래를 위해 모으는 걸 중요하게 봐요. 돈 문제가 감정 문제로 번질 수 있어요.',
  },
]

function similarity(a, b) {
  return Math.round(100 - Math.abs(a - b))
}

/** 보완성 지표: 간격 20~45를 최적구간으로 본다. 너무 같으면(둘 다 극단으로 같은 방향)
 * 오히려 부딪힐 수 있고, 너무 멀면 접점이 없어 이 또한 낮게 평가한다. */
function complementScore(gap) {
  if (gap >= 20 && gap <= 45) return 90
  if (gap < 20) return Math.round(60 - (20 - gap) * 1.5)
  return Math.round(Math.max(0, 90 - (gap - 45) * 1.2))
}

function findRisk(scoresA, scoresB) {
  const frictions = []
  for (const rule of RISK_RULES) {
    const a = scoresA[rule.a]
    const b = scoresB[rule.b]
    const aRev = scoresA[rule.b]
    const bRev = scoresB[rule.a]
    const hit =
      (a !== undefined && b !== undefined && a >= rule.threshold && b >= rule.threshold) ||
      (aRev !== undefined && bRev !== undefined && aRev >= rule.threshold && bRev >= rule.threshold)
    if (hit) frictions.push({ label: rule.label, detail: rule.detail })
  }
  return frictions
}

/** scoresA/B: { [dimension]: number } — 두 사람의 ME 결과 차원 점수 맵 */
export function computePair(scoresA, scoresB) {
  const rows = []

  for (const dim of SIMILARITY_DIMENSIONS) {
    const a = scoresA[dim]
    const b = scoresB[dim]
    if (a === undefined || b === undefined) continue
    rows.push({ dimension: dim, category: categoryOf(dim), a, b, kind: 'similarity', score: similarity(a, b) })
  }

  for (const dim of COMPLEMENT_DIMENSIONS) {
    const a = scoresA[dim]
    const b = scoresB[dim]
    if (a === undefined || b === undefined) continue
    rows.push({
      dimension: dim,
      category: categoryOf(dim),
      a,
      b,
      kind: 'complement',
      score: complementScore(Math.abs(a - b)),
    })
  }

  const overallScore = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0
  const strong = rows.filter((r) => r.score >= 70).sort((x, y) => y.score - x.score)
  const weak = rows.filter((r) => r.score <= 40).sort((x, y) => x.score - y.score)
  const frictions = findRisk(scoresA, scoresB)

  const byCategory = {}
  for (const r of rows) {
    if (!byCategory[r.category]) byCategory[r.category] = []
    byCategory[r.category].push(r)
  }
  const categories = Object.entries(byCategory).map(([category, catRows]) => ({
    category,
    score: Math.round(catRows.reduce((sum, r) => sum + r.score, 0) / catRows.length),
    rows: catRows,
  }))

  return { rows, categories, overallScore, strong, weak, frictions }
}

const GUIDE_RULES = [
  {
    match: (a, b) => (a['즉시해결욕구'] ?? 0) >= 60 && (b['냉각시간욕구'] ?? 0) >= 60,
    label: '싸울 때 하지 말아야 할 것',
    tip: '싸운 직후 바로 답을 요구하지 않기. 한 명에게는 시간이 필요해요.',
  },
  {
    match: (a, b) => Math.abs((a['냉각시간욕구'] ?? 50) - (b['냉각시간욕구'] ?? 50)) >= 30,
    label: '화해할 때 가장 효과적인 방식',
    tip: '감정이 가라앉을 시간을 준 다음, 짧게라도 먼저 대화를 제안하기.',
  },
  {
    match: (a, b) => Math.abs((a['연락욕구'] ?? 50) - (b['연락욕구'] ?? 50)) >= 30,
    label: '연락 문제 합의 방법',
    tip: '바쁠 땐 짧게라도 답장하기로 미리 정해두면 서운함이 줄어요.',
  },
  {
    match: (a, b) => Math.abs((a['개인공간욕구'] ?? 50) - (b['개인공간욕구'] ?? 50)) >= 30,
    label: '개인시간 규칙',
    tip: '혼자만의 시간을 미리 알려주고 존중받기로 정해두기.',
  },
  {
    match: (a, b) => (a['용서성'] ?? 50) <= 40 || (b['용서성'] ?? 50) <= 40,
    label: '신뢰 회복 방식',
    tip: '같은 문제가 반복되지 않는지, 말보다 행동으로 확인하는 시간을 주기.',
  },
]

/** scoresA/B: { [dimension]: number } -> [{ label, tip }] 최대 3개 */
export function coupleGuide(scoresA, scoresB) {
  return GUIDE_RULES.filter((r) => r.match(scoresA, scoresB))
    .slice(0, 3)
    .map((r) => ({ label: r.label, tip: r.tip }))
}

export function pairTypeLabel(scoresA, scoresB) {
  const a = scoresA['주도권욕구']
  const b = scoresB['주도권욕구']
  if (a === undefined || b === undefined) return null
  const HIGH = 65
  const LOW = 35
  if (a >= HIGH && b >= HIGH) return '리더 × 리더'
  if (a <= LOW && b <= LOW) return '조율자 × 조율자'
  if (a >= HIGH || b >= HIGH) return '리더 × 조율자'
  return '균형형'
}
