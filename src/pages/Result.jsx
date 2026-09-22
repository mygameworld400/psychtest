import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { tests } from '../data/tests/sample'
import { aiTests } from '../data/tests/rewind'
import { resultInfo } from '../services/testEngine'
import { getResult } from '../services/resultService'

export default function Result() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getResult(id)
      .then((r) => (r ? setResult(r) : setError(true)))
      .catch(() => setError(true))
  }, [id])

  if (error) return <div className="page">결과를 찾을 수 없어요.</div>
  if (!result) return <div className="page">불러오는 중…</div>

  const shareUrl = `${location.origin}${location.pathname}#/result/${id}`

  if (result.ai_analysis) {
    const test = aiTests[result.test_slug]
    return (
      <div className="page page-result page-ai-result">
        <div className="result-type">{test?.title ?? result.test_slug}</div>
        <div className="ai-analysis">
          {result.ai_analysis
            .split('\n')
            .filter((line) => line.trim())
            .map((line, i) => {
              const bold = /^\*\*(.+)\*\*$/.exec(line.trim())
              return bold ? (
                <p key={i} className="summary">
                  {bold[1]}
                </p>
              ) : (
                <p key={i}>{line}</p>
              )
            })}
        </div>
        <button onClick={() => navigator.clipboard.writeText(shareUrl)}>
          결과 링크 복사
        </button>
      </div>
    )
  }

  const test = tests[result.test_slug]
  const info = resultInfo(test, result.result_type)

  return (
    <div className="page page-result">
      <div className="result-type">{result.result_type}</div>
      <h2>{info.title}</h2>
      <p>{info.desc}</p>

      <button onClick={() => navigator.clipboard.writeText(shareUrl)}>
        결과 링크 복사
      </button>
      <Link to={`/compat?a=${id}`} className="link-secondary">
        이 결과로 궁합 보기 →
      </Link>
    </div>
  )
}
