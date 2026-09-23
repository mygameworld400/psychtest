// PAIR 전용 — "같은 행동을 다르게 해석하는 지점". 한 차원에서 두 사람 점수 차이가
// 크게 벌어지면, 높은 쪽과 낮은 쪽이 같은 행동을 어떻게 다르게 읽는지 보여준다.
const MISREAD_RULES = [
  { dim: '연락욕구', gap: 35, action: '연락을 자주 하는 것', high: '관심의 표현', low: '부담감' },
  { dim: '투명성요구', gap: 35, action: '일정을 세세히 공유하는 것', high: '신뢰의 증거', low: '사생활 침해' },
  { dim: '사랑표현_스킨십', gap: 35, action: '스킨십을 자주 하는 것', high: '자연스러운 애정 표현', low: '부담스러운 요구' },
  { dim: '소비성향', gap: 35, action: '돈을 쓰는 것', high: '지금을 충분히 즐기는 것', low: '계획 없는 소비' },
  { dim: '통제욕구', gap: 35, action: '일정에 관여하는 것', high: '함께하고 싶은 마음', low: '간섭' },
]

/** scoresA/B: { [dimension]: number } -> [{ label, action, highSide, highMeaning, lowSide, lowMeaning }] */
export function findMisreads(scoresA, scoresB, labelA = 'A', labelB = 'B') {
  const items = []
  for (const rule of MISREAD_RULES) {
    const a = scoresA[rule.dim]
    const b = scoresB[rule.dim]
    if (a === undefined || b === undefined) continue
    if (Math.abs(a - b) < rule.gap) continue
    const [highSide, lowSide] = a >= b ? [labelA, labelB] : [labelB, labelA]
    items.push({
      dimension: rule.dim,
      action: rule.action,
      highSide,
      highMeaning: rule.high,
      lowSide,
      lowMeaning: rule.low,
      gap: Math.round(Math.abs(a - b)),
    })
  }
  return items
}
