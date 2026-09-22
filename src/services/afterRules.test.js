import { describe, it, expect } from 'vitest'
import { matchAfterRules } from './afterRules'

describe('matchAfterRules', () => {
  it('matches "상대보다 공백이 그리운 상태"', () => {
    const scores = { 재결합욕구: 75, 외로움영향: 72, 생활공백영향: 80, 상대자체애정: 40 }
    expect(matchAfterRules(scores)).toContain(
      '다시 만나고 싶은 마음은 강하지만, 상대 자체에 대한 애정보다 관계가 사라진 뒤 생긴 공백과 외로움의 영향이 더 크게 나타납니다.',
    )
  })

  it('does not match when 상대자체애정 is too high', () => {
    const scores = { 재결합욕구: 75, 외로움영향: 72, 생활공백영향: 80, 상대자체애정: 60 }
    expect(matchAfterRules(scores)).toHaveLength(0)
  })

  it('matches "사랑은 남았지만 재결합 준비는 낮음"', () => {
    const scores = { 상대자체애정: 75, 재결합욕구: 70, 과거문제해결가능성: 30, 동일갈등재발위험: 80 }
    expect(matchAfterRules(scores)).toContain(
      '애정은 남아 있지만, 이별 원인이 해결되지 않은 상태라 지금 다시 만나면 같은 갈등이 반복될 가능성이 높은 구조입니다.',
    )
  })
})
