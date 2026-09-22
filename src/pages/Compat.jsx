import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { tests } from '../data/tests/sample'
import { resultInfo } from '../services/testEngine'
import { computeCompat } from '../services/compatEngine'
import { getResult } from '../services/resultService'

export default function Compat() {
  const [params, setParams] = useSearchParams()
  const [idA, setIdA] = useState(params.get('a') ?? '')
  const [idB, setIdB] = useState(params.get('b') ?? '')
  const [pair, setPair] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.get('a') && params.get('b')) load(params.get('a'), params.get('b'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load(a, b) {
    setError('')
    setPair(null)
    try {
      const [resA, resB] = await Promise.all([getResult(a), getResult(b)])
      if (!resA || !resB) return setError('결과 코드를 찾을 수 없어요.')
      if (resA.test_slug !== resB.test_slug) return setError('같은 테스트 결과끼리만 궁합을 볼 수 있어요.')
      setPair({ resA, resB, test: tests[resA.test_slug] })
    } catch {
      setError('궁합을 불러오는 중 문제가 생겼어요.')
    }
  }

  function submit(e) {
    e.preventDefault()
    setParams({ a: idA, b: idB })
    load(idA, idB)
  }

  return (
    <div className="page page-compat">
      <h1>궁합 보기</h1>
      <form onSubmit={submit} className="compat-form">
        <input placeholder="내 결과 코드" value={idA} onChange={(e) => setIdA(e.target.value)} />
        <input placeholder="상대 결과 코드" value={idB} onChange={(e) => setIdB(e.target.value)} />
        <button type="submit">궁합 보기</button>
      </form>

      {error && <p className="error">{error}</p>}

      {pair && (
        <CompatCard test={pair.test} resA={pair.resA} resB={pair.resB} />
      )}
    </div>
  )
}

function CompatCard({ test, resA, resB }) {
  const infoA = resultInfo(test, resA.result_type)
  const infoB = resultInfo(test, resB.result_type)
  const compat = computeCompat(test, resA.result_type, resB.result_type)

  return (
    <div className="compat-card">
      <div className="compat-types">
        <span>{infoA.title} ({resA.result_type})</span>
        <span>×</span>
        <span>{infoB.title} ({resB.result_type})</span>
      </div>
      <div className="compat-score">{compat.score}%</div>
      <p>{compat.tier}</p>
    </div>
  )
}
