// ME 결과 두 개를 비교해 궁합을 계산한다. 대부분의 차원은 유사도(similarity =
// 100 - |A-B|)로 보되, 갈등 속도·신뢰 경계처럼 비슷해야 좋은 게 아니라 극단으로
// 갈리면 충돌하는 축은 별도 규칙으로 판단한다.

const SPECIAL_RULES = [
  {
    dimension: 'conflict_speed',
    match: (a, b) => (a >= 80 && b <= 20) || (b >= 80 && a <= 20),
    label: '추격-회피 충돌',
    detail: '한 명은 갈등을 그 자리에서 풀고 싶어 하고, 다른 한 명은 혼자 정리할 시간이 필요해요. 한 명이 계속 대화를 요구할수록 다른 한 명은 더 멀어질 수 있어요.',
  },
  {
    dimension: 'trust_boundary',
    match: (a, b) => (a >= 80 && b <= 20) || (b >= 80 && a <= 20),
    label: '사생활 경계 충돌',
    detail: '한 명은 투명하게 공유하는 걸 신뢰의 증거로 보고, 다른 한 명은 공유 없이도 사생활이 존중되길 바라요. 이 기준 차이에서 반복적으로 부딪힐 수 있어요.',
  },
]

/** scoresA/B: { [dimension]: number } */
export function computePair(scoresA, scoresB) {
  const dimensions = Object.keys(scoresA).filter((k) => scoresB[k] !== undefined)

  const rows = dimensions.map((dimension) => {
    const a = scoresA[dimension]
    const b = scoresB[dimension]
    const rule = SPECIAL_RULES.find((r) => r.dimension === dimension && r.match(a, b))
    const similarity = Math.round(100 - Math.abs(a - b))
    return {
      dimension,
      a,
      b,
      gap: Math.abs(a - b),
      similarity: rule ? Math.min(similarity, 35) : similarity,
      friction: rule ? { label: rule.label, detail: rule.detail } : null,
    }
  })

  const overallScore = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.similarity, 0) / rows.length)
    : 0

  const strong = rows.filter((r) => !r.friction && r.similarity >= 70).sort((x, y) => y.similarity - x.similarity)
  const weak = rows
    .filter((r) => r.friction || r.similarity <= 40)
    .sort((x, y) => x.similarity - y.similarity)

  return { rows, overallScore, strong, weak }
}

export function pairTypeLabel(scoresA, scoresB) {
  const a = scoresA.initiative
  const b = scoresB.initiative
  if (a === undefined || b === undefined) return null
  const HIGH = 60
  const LOW = 40
  if (a >= HIGH && b >= HIGH) return '리더 × 리더'
  if (a <= LOW && b <= LOW) return '조율자 × 조율자'
  if (a >= HIGH || b >= HIGH) return '리더 × 조율자'
  return '균형형'
}
