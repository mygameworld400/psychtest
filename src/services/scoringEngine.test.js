import { describe, it, expect } from 'vitest'
import { likertToScore, computeDimensionScores, selectPriorityDimensions } from './scoringEngine'

const bank = {
  dimensions: [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },
  ],
  items: [
    { id: 'q1', type: 'likert', text: '', dimensions: ['a'], reverse: false },
    { id: 'q2', type: 'likert', text: '', dimensions: ['a'], reverse: true },
    { id: 'q3', type: 'likert', text: '', dimensions: ['b'], reverse: false },
    { id: 'free', type: 'free_text', text: '', dimensions: [], optional: true },
  ],
}

describe('likertToScore', () => {
  it('maps 1~5 to 0/25/50/75/100', () => {
    expect(likertToScore(1, false)).toBe(0)
    expect(likertToScore(3, false)).toBe(50)
    expect(likertToScore(5, false)).toBe(100)
  })

  it('reverses the score when reverse is true', () => {
    expect(likertToScore(1, true)).toBe(100)
    expect(likertToScore(5, true)).toBe(0)
  })

  it('returns null for an unmapped value', () => {
    expect(likertToScore(0, false)).toBeNull()
  })
})

describe('computeDimensionScores', () => {
  it('averages normal + reversed items into the same dimension', () => {
    const scores = computeDimensionScores(bank, [
      { questionId: 'q1', value: 5 }, // -> 100
      { questionId: 'q2', value: 5 }, // reverse -> 0
    ])
    expect(scores.a.normalizedScore).toBe(50)
    expect(scores.a.answeredCount).toBe(2)
  })

  it('marks an unanswered dimension with null score and 0 confidence', () => {
    const scores = computeDimensionScores(bank, [])
    expect(scores.a.normalizedScore).toBeNull()
    expect(scores.a.confidence).toBe(0)
    expect(scores.b.normalizedScore).toBeNull()
  })

  it('confidence reflects how many of the dimension items were answered', () => {
    const scores = computeDimensionScores(bank, [{ questionId: 'q1', value: 3 }])
    expect(scores.a.confidence).toBe(50) // 1 of 2 items in dimension a
    expect(scores.b.confidence).toBe(0)
  })

  it('ignores free_text items entirely', () => {
    const scores = computeDimensionScores(bank, [{ questionId: 'free', value: 5 }])
    expect(scores.a.normalizedScore).toBeNull()
  })
})

describe('selectPriorityDimensions', () => {
  it('prioritizes extreme scores over middling ones', () => {
    const dims = {
      extreme: { dimension: 'extreme', normalizedScore: 90, confidence: 100, answeredCount: 2 },
      mid: { dimension: 'mid', normalizedScore: 50, confidence: 100, answeredCount: 2 },
    }
    const picked = selectPriorityDimensions(dims, { limit: 1 })
    expect(picked[0].dimension).toBe('extreme')
  })

  it('drops dimensions with no score', () => {
    const dims = {
      a: { dimension: 'a', normalizedScore: null, confidence: 0, answeredCount: 0 },
      b: { dimension: 'b', normalizedScore: 60, confidence: 100, answeredCount: 2 },
    }
    const picked = selectPriorityDimensions(dims, { limit: 10 })
    expect(picked).toHaveLength(1)
    expect(picked[0].dimension).toBe('b')
  })

  it('boosts dimensions relevant to the selected focus problem', () => {
    const dims = {
      focus: { dimension: 'focus', normalizedScore: 55, confidence: 100, answeredCount: 2 },
      other: { dimension: 'other', normalizedScore: 55, confidence: 100, answeredCount: 2 },
    }
    const picked = selectPriorityDimensions(dims, { limit: 1, focusDimensions: ['focus'] })
    expect(picked[0].dimension).toBe('focus')
  })
})
