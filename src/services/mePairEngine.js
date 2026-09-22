// 마스터 스펙 7장 PAIR 궁합 계산 규칙 그대로 구현한다.
// - 유사성 지표: similarity = 100 - |A-B|
// - 보완성 지표: 무조건 비슷하다고 좋은 게 아니라 간격 20~45이 최적구간
// - 위험 신호: 정해진 두 극단 조합이 겹치면 별도 충돌 문구를 띄운다

export const SIMILARITY_DIMENSIONS = [
  '연락욕구',
  '개인공간욕구',
  '소비성향',
  '저축성향',
  '결혼의향',
  '자녀의향',
  '사생활존중',
  '즉시해결욕구',
]

export const COMPLEMENT_DIMENSIONS = ['주도권욕구', '계획성', '문제해결지향']

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
    rows.push({ dimension: dim, a, b, kind: 'similarity', score: similarity(a, b) })
  }

  for (const dim of COMPLEMENT_DIMENSIONS) {
    const a = scoresA[dim]
    const b = scoresB[dim]
    if (a === undefined || b === undefined) continue
    rows.push({ dimension: dim, a, b, kind: 'complement', score: complementScore(Math.abs(a - b)) })
  }

  const overallScore = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0
  const strong = rows.filter((r) => r.score >= 70).sort((x, y) => y.score - x.score)
  const weak = rows.filter((r) => r.score <= 40).sort((x, y) => x.score - y.score)
  const frictions = findRisk(scoresA, scoresB)

  return { rows, overallScore, strong, weak, frictions }
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
