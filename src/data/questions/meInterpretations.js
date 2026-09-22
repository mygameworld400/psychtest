// 차원이 70개가 넘어가면서 차원마다 문장을 일일이 손으로 쓰는 건 지속 가능하지 않다.
// (실제로는 여기 마스터 스펙 16번 원칙대로 "AI가 계산된 점수를 설명"하는 게 맞는 설계다 —
// OpenAI 크레딧이 준비되면 이 함수를 그 자리로 교체하면 된다.)
// 그때까지는 차원명 자체가 이미 서술형이라는 점을 살려 일관된 톤의 일반화 문장을 만든다.

function particle(label, withHas, withoutHas) {
  const last = label.charCodeAt(label.length - 1)
  const hasBatchim = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0
  return hasBatchim ? withHas : withoutHas
}

export function interpretationFor(dimensionKey, score) {
  const label = dimensionKey
  const eun = particle(label, '은', '는')
  const i = particle(label, '이', '가')

  if (score >= 80) return `'${label}'${i} 답변에서 뚜렷하게 강하게 나타났어요.`
  if (score >= 65) return `'${label}'${eun} 답변 전반에서 비교적 높게 나타나는 편이에요.`
  if (score <= 20) return `'${label}'${eun} 답변에서 거의 드러나지 않았어요.`
  if (score <= 35) return `'${label}'${eun} 답변에서 상대적으로 약하게 나타나는 편이에요.`
  return `'${label}'${eun} 특별히 강하지도 약하지도 않은, 평범한 수준으로 나타났어요.`
}
