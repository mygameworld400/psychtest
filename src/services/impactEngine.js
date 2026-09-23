// PAIR 전용 — "A가 B에게 미치는 영향" 비대칭 계산. RISK_RULES와 같은 패턴으로,
// 한쪽의 특정 차원이 임계값을 넘으면 상대방이 받는 영향을 정해진 라벨+부호로 낸다.
// 점수는 AI가 지어내지 않는다 — 여기 정의한 규칙표에서만 나온다.
const IMPACT_RULES = [
  { dim: '주도권욕구', threshold: 65, effects: [{ label: '확신 제공', value: 18 }, { label: '개인공간', value: -12 }] },
  { dim: '계획성', threshold: 65, effects: [{ label: '생활 안정', value: 20 }, { label: '자유도', value: -10 }] },
  { dim: '감정표현성', threshold: 65, effects: [{ label: '정서적 안정', value: 19 }] },
  { dim: '통제욕구', threshold: 65, effects: [{ label: '자유도', value: -14 }] },
  { dim: '사생활존중', threshold: 35, effects: [{ label: '개인공간', value: 16 }], invert: true },
  { dim: '즉시해결욕구', threshold: 65, effects: [{ label: '갈등 해소 속도', value: 15 }] },
  { dim: '소비성향', threshold: 65, effects: [{ label: '새로운 경험', value: 17 }] },
  { dim: '안정추구', threshold: 65, effects: [{ label: '정서적 안정', value: 13 }] },
  { dim: '유연성', threshold: 65, effects: [{ label: '스트레스 완화', value: 14 }] },
]

function effectsFor(scores) {
  const items = []
  for (const rule of IMPACT_RULES) {
    const v = scores[rule.dim]
    if (v === undefined) continue
    const hit = rule.invert ? v <= rule.threshold : v >= rule.threshold
    if (!hit) continue
    items.push(...rule.effects)
  }
  return items
}

/** scoresA/B: { [dimension]: number } -> { aToB, bToA } — 각각 라벨+부호 영향 리스트 */
export function computeImpact(scoresA, scoresB) {
  return {
    aToB: effectsFor(scoresA),
    bToA: effectsFor(scoresB),
  }
}
