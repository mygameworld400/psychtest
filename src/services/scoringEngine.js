// 점수는 여기서만 계산한다. AI는 계산된 점수를 설명만 할 뿐 새 점수를 만들지 않는다.

const LIKERT_TO_SCORE = { 1: 0, 2: 25, 3: 50, 4: 75, 5: 100 }

export function likertToScore(value, reverse) {
  const score = LIKERT_TO_SCORE[value]
  if (score === undefined) return null
  return reverse ? 100 - score : score
}

/** responses: [{ questionId, value }]  (value는 likert 1~5, free_text 문항은 무시)
 * questionBank: me.v1.json 형태 { items: [...] } */
export function computeDimensionScores(questionBank, responses) {
  const answered = Object.fromEntries(responses.map((r) => [r.questionId, r.value]))

  const perDimension = {}
  for (const dim of questionBank.dimensions) perDimension[dim.key] = { scores: [], answeredCount: 0, totalCount: 0 }

  for (const item of questionBank.items) {
    if (item.type !== 'likert') continue
    for (const dimKey of item.dimensions) {
      perDimension[dimKey].totalCount += 1
      const raw = answered[item.id]
      if (raw === undefined || raw === null) continue
      const score = likertToScore(raw, item.reverse)
      if (score === null) continue
      perDimension[dimKey].scores.push(score)
      perDimension[dimKey].answeredCount += 1
    }
  }

  const result = {}
  for (const [key, d] of Object.entries(perDimension)) {
    if (d.scores.length === 0) {
      result[key] = { dimension: key, normalizedScore: null, confidence: 0, answeredCount: 0 }
      continue
    }
    const mean = d.scores.reduce((a, b) => a + b, 0) / d.scores.length
    result[key] = {
      dimension: key,
      normalizedScore: Math.round(mean),
      confidence: computeConfidence(d),
      answeredCount: d.answeredCount,
    }
  }
  return result
}

/** 답변 개수와 결측 비율로 0~100 신뢰도를 낸다. 모순 항목 쌍 검출은 문항이
 * 늘어나면(같은 차원 내 상반된 문항 쌍) 확장한다 — 지금은 결측 비율만 반영. */
function computeConfidence(d) {
  if (d.totalCount === 0) return 0
  const answeredRatio = d.answeredCount / d.totalCount
  return Math.round(answeredRatio * 100)
}

/** 노출할 상위 N개 차원을 고른다. 극단값(>=80 or <=20)일수록, 그리고
 * 관심 문제(focusDimensions)에 해당할수록 우선순위가 높다. */
export function selectPriorityDimensions(dimensionScores, { limit = 10, focusDimensions = [] } = {}) {
  const scored = Object.values(dimensionScores)
    .filter((d) => d.normalizedScore !== null)
    .map((d) => {
      let priority = 0
      if (d.normalizedScore >= 80 || d.normalizedScore <= 20) priority += 3
      if (focusDimensions.includes(d.dimension)) priority += 3
      return { ...d, priority }
    })
    .sort((a, b) => b.priority - a.priority || b.confidence - a.confidence)

  return scored.slice(0, limit)
}
