import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMeResult } from '../services/assessmentService'
import { computePair, pairTypeLabel } from '../services/mePairEngine'

function toScoreMap(scores) {
  return Object.fromEntries(scores.map((s) => [s.dimension_key, s.normalized_score]))
}

export default function MePair() {
  const [params, setParams] = useSearchParams()
  const [codeA, setCodeA] = useState(params.get('a') ?? '')
  const [codeB, setCodeB] = useState(params.get('b') ?? '')
  const [pair, setPair] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (params.get('a') && params.get('b')) load(params.get('a'), params.get('b'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load(a, b) {
    setError('')
    setPair(null)
    setLoading(true)
    try {
      const [resA, resB] = await Promise.all([getMeResult(a), getMeResult(b)])
      if (!resA || !resB) return setError('결과 코드를 찾을 수 없어요.')
      if (resA.assessment.product_type !== 'ME' || resB.assessment.product_type !== 'ME') {
        return setError('나의 연애 성향 테스트 결과끼리만 궁합을 볼 수 있어요.')
      }
      const scoresA = toScoreMap(resA.scores)
      const scoresB = toScoreMap(resB.scores)
      setPair({ ...computePair(scoresA, scoresB), typeLabel: pairTypeLabel(scoresA, scoresB) })
    } catch {
      setError('궁합을 불러오는 중 문제가 생겼어요.')
    } finally {
      setLoading(false)
    }
  }

  function submit(e) {
    e.preventDefault()
    setParams({ a: codeA, b: codeB })
    load(codeA, codeB)
  }

  return (
    <div className="page page-me-pair">
      <h1>우리 궁합</h1>
      <p className="sub">각자 &apos;나의 연애 성향&apos; 테스트를 하고, 결과 코드 두 개를 넣어주세요.</p>

      <form onSubmit={submit} className="compat-form">
        <input placeholder="내 결과 코드" value={codeA} onChange={(e) => setCodeA(e.target.value)} />
        <input placeholder="상대 결과 코드" value={codeB} onChange={(e) => setCodeB(e.target.value)} />
        <button type="submit" disabled={loading}>
          {loading ? '계산 중…' : '궁합 보기'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {pair && (
        <div className="pair-result">
          <div className="compat-score">{pair.overallScore}</div>
          {pair.typeLabel && <div className="pair-type">{pair.typeLabel}</div>}

          {pair.strong.length > 0 && (
            <>
              <h2 className="section-title">잘 맞는 부분</h2>
              <ul className="pair-list">
                {pair.strong.slice(0, 4).map((r) => (
                  <li key={r.dimension}>
                    <div>
                      {r.dimension}
                      <span className="pair-list-score">{r.score}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {pair.weak.length > 0 && (
            <>
              <h2 className="section-title">엇갈리는 부분</h2>
              <ul className="pair-list">
                {pair.weak.slice(0, 4).map((r) => (
                  <li key={r.dimension}>
                    <div>
                      {r.dimension}
                      <span className="pair-list-score">{r.score}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {pair.frictions.length > 0 && (
            <>
              <h2 className="section-title">충돌할 가능성이 있는 부분</h2>
              <ul className="pair-list">
                {pair.frictions.map((f) => (
                  <li key={f.label}>
                    <div>{f.label}</div>
                    <p className="pair-friction">{f.detail}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
