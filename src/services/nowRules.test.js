import { describe, it, expect } from 'vitest'
import { matchNowRules } from './nowRules'

describe('matchNowRules', () => {
  it('matches "쉬고 싶은 것 vs 헤어지고 싶은 것" when conditions align', () => {
    const scores = { 관계에너지방전: 80, 혼자회복욕구: 75, 애정잔존: 65, 관계종료의사: 30 }
    expect(matchNowRules(scores)).toContain(
      '현재는 관계를 끝내고 싶은 마음보다 관계에서 잠시 벗어나 회복하고 싶은 욕구가 더 강하게 나타납니다.',
    )
  })

  it('does not match when 관계종료의사 is too high', () => {
    const scores = { 관계에너지방전: 80, 혼자회복욕구: 75, 애정잔존: 65, 관계종료의사: 60 }
    expect(matchNowRules(scores)).toHaveLength(0)
  })

  it('matches "애정 감소보다 신뢰 손상"', () => {
    const scores = { 신뢰손상: 75, 애정잔존: 65, 상대말불신: 70 }
    expect(matchNowRules(scores)).toContain(
      '애정 자체가 크게 사라졌다기보다, 반복된 사건으로 인해 상대의 말과 행동을 믿기 어려워진 점이 현재 관계의 중심 문제에 가깝습니다.',
    )
  })

  it('can match multiple rules at once', () => {
    const scores = {
      관계에너지방전: 80,
      혼자회복욕구: 75,
      애정잔존: 65,
      관계종료의사: 30,
      신뢰손상: 75,
      상대말불신: 70,
    }
    expect(matchNowRules(scores)).toHaveLength(2)
  })
})
