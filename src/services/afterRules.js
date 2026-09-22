// 마스터 스펙 9장 AFTER 해석 규칙.
const RULES = [
  {
    id: 'void_not_partner',
    match: (s) =>
      (s['재결합욕구'] ?? 0) >= 70 &&
      (s['외로움영향'] ?? 0) >= 70 &&
      (s['생활공백영향'] ?? 0) >= 70 &&
      (s['상대자체애정'] ?? 100) <= 55,
    text: '다시 만나고 싶은 마음은 강하지만, 상대 자체에 대한 애정보다 관계가 사라진 뒤 생긴 공백과 외로움의 영향이 더 크게 나타납니다.',
  },
  {
    id: 'love_not_ready',
    match: (s) =>
      (s['상대자체애정'] ?? 0) >= 70 &&
      (s['재결합욕구'] ?? 0) >= 65 &&
      (s['과거문제해결가능성'] ?? 100) <= 45 &&
      (s['동일갈등재발위험'] ?? 0) >= 70,
    text: '애정은 남아 있지만, 이별 원인이 해결되지 않은 상태라 지금 다시 만나면 같은 갈등이 반복될 가능성이 높은 구조입니다.',
  },
]

/** scores: { [dimension]: number } -> 매칭된 핵심 문장 배열 (0개일 수도 있음) */
export function matchAfterRules(scores) {
  return RULES.filter((r) => r.match(scores)).map((r) => r.text)
}
