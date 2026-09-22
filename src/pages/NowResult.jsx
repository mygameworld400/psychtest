import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import nowQuestionBank from '../data/questions/now.v1.json'
import { interpretationFor } from '../data/questions/meInterpretations'
import { selectPriorityDimensions } from '../services/scoringEngine'
import { matchNowRules } from '../services/nowRules'
import { getAssessmentResult } from '../services/assessmentService'

const DIMENSION_LABELS = Object.fromEntries(nowQuestionBank.dimensions.map((d) => [d.key, d.label]))

export default function NowResult() {
  const { assessmentId } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(false)
  const [openKey, setOpenKey] = useState(null)

  useEffect(() => {
    getAssessmentResult(assessmentId)
      .then((r) => (r ? setResult(r) : setError(true)))
      .catch(() => setError(true))
  }, [assessmentId])

  if (error) return <div className="page">결과를 찾을 수 없어요.</div>
  if (!result) return <div className="page">불러오는 중…</div>

  const scoreMap = Object.fromEntries(result.scores.map((s) => [s.dimension_key, s.normalized_score]))
  const dimensionScores = Object.fromEntries(
    result.scores.map((s) => [
      s.dimension_key,
      { dimension: s.dimension_key, normalizedScore: s.normalized_score, confidence: s.confidence },
    ]),
  )
  const cards = selectPriorityDimensions(dimensionScores, { limit: 9 })
  const headlines = matchNowRules(scoreMap)
  const shareUrl = `${location.origin}${location.pathname}#/now/result/${assessmentId}`

  return (
    <div className="page page-me-result">
      <h1>현재 관계 상태</h1>
      <p className="sub">지금 응답 기준으로 나타난 상태 신호야. 미래를 단정하는 게 아니라 지금의 경향이야.</p>

      {headlines.length > 0 && (
        <div className="now-headline">
          {headlines.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      )}

      <div className="dimension-cards">
        {cards.map((c) => (
          <div key={c.dimension} className="dimension-card">
            <div className="dimension-name">{DIMENSION_LABELS[c.dimension] ?? c.dimension}</div>
            <div className="dimension-score">{c.normalizedScore}</div>
            <p className="dimension-desc">{interpretationFor(c.dimension, c.normalizedScore)}</p>
            <button className="why-toggle" onClick={() => setOpenKey(openKey === c.dimension ? null : c.dimension)}>
              {openKey === c.dimension ? '접기' : '왜 이렇게 나왔나요?'}
            </button>
            {openKey === c.dimension && (
              <p className="why-detail">
                답변 신뢰도 {c.confidence}% — 관련 문항에 대한 응답을 기반으로 계산했어. 신뢰도가 낮으면 문항에
                답하지 않았거나 응답이 갈렸다는 뜻이야.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="result-code">
        결과 코드 <code>{assessmentId}</code>
      </div>

      <button className="primary" onClick={() => navigator.clipboard.writeText(shareUrl)}>
        결과 링크 복사
      </button>
      <Link to="/" className="link-secondary">
        홈으로 →
      </Link>
    </div>
  )
}
