/** 두 결과 타입의 궁합을 계산한다. 테스트별 커스텀 문구가 있으면 그걸 쓰고,
 * 없으면 축(axis)별로 같은 극인 비율로 점수를 낸다. */
export function computeCompat(test, typeA, typeB) {
  const custom = test.compatOverrides?.[[typeA, typeB].sort().join('-')]
  if (custom) return custom

  const lettersA = typeA.split('')
  const lettersB = typeB.split('')
  const matches = lettersA.filter((c, i) => c === lettersB[i]).length
  const score = Math.round((matches / lettersA.length) * 100)

  let tier
  if (score >= 75) tier = '찰떡궁합이에요! 🔥'
  else if (score >= 50) tier = '꽤 잘 맞는 편이에요 :)'
  else if (score >= 25) tier = '다른 점이 많아 서로 배울 게 있어요.'
  else tier = '정반대라 신선한 자극이 될 거예요.'

  return { score, tier }
}
