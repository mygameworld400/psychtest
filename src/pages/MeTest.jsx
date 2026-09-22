import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import meQuestionBank from '../data/questions/me.v1.json'
import { submitMeAssessment } from '../services/assessmentService'

const LIKERT_LABELS = ['전혀 아니다', '아닌 편', '보통', '그런 편', '매우 그렇다']
const INTERMISSION_EVERY = 9

export default function MeTest() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // questionId -> { value } | { freeText }
  const [freeTextDraft, setFreeTextDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [showIntermission, setShowIntermission] = useState(false)

  const items = meQuestionBank.items
  const item = items[index]
  const total = items.length

  function goNext(nextAnswers) {
    const nextIndex = index + 1
    if (nextIndex >= total) {
      finish(nextAnswers)
      return
    }
    if (nextIndex > 0 && nextIndex % INTERMISSION_EVERY === 0) {
      setShowIntermission(true)
    }
    setFreeTextDraft('')
    setIndex(nextIndex)
  }

  function answerLikert(value) {
    const nextAnswers = { ...answers, [item.id]: { questionId: item.id, value } }
    setAnswers(nextAnswers)
    goNext(nextAnswers)
  }

  function answerFreeText(freeText) {
    const nextAnswers = freeText.trim()
      ? { ...answers, [item.id]: { questionId: item.id, freeText: freeText.trim() } }
      : answers
    goNext(nextAnswers)
  }

  function goBack() {
    if (index === 0) return
    setFreeTextDraft('')
    setIndex(index - 1)
  }

  async function finish(finalAnswers) {
    setSubmitting(true)
    setError(false)
    try {
      const { id } = await submitMeAssessment(Object.values(finalAnswers))
      navigate(`/me/result/${id}`)
    } catch {
      setSubmitting(false)
      setError(true)
    }
  }

  if (submitting) {
    return (
      <div className="page page-analyzing">
        <p>답변을 분석하고 있어요…</p>
      </div>
    )
  }

  if (showIntermission) {
    return (
      <div className="page page-intermission">
        <p>잘 하고 있어요 ✨</p>
        <p className="sub">
          {index} / {total} 문항 완료
        </p>
        <button onClick={() => setShowIntermission(false)}>계속하기</button>
      </div>
    )
  }

  return (
    <div className="page page-me-test">
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <div className="progress">
        {index + 1} / {total}
      </div>

      <h2>{item.text}</h2>

      {item.type === 'likert' && (
        <div className="likert">
          {LIKERT_LABELS.map((label, i) => (
            <button key={i} onClick={() => answerLikert(i + 1)}>
              {label}
            </button>
          ))}
        </div>
      )}

      {item.type === 'free_text' && (
        <div className="reason-box">
          <textarea
            value={freeTextDraft}
            onChange={(e) => setFreeTextDraft(e.target.value)}
            placeholder="자유롭게 적어줘"
            rows={4}
          />
          <div className="free-text-actions">
            <button className="ghost" onClick={() => answerFreeText('')}>
              건너뛰기
            </button>
            <button className="submit" onClick={() => answerFreeText(freeTextDraft)}>
              다음
            </button>
          </div>
        </div>
      )}

      {index > 0 && (
        <button className="back-link" onClick={goBack}>
          ← 이전
        </button>
      )}

      {error && <p className="error">저장에 실패했어요. 다시 시도해주세요.</p>}
    </div>
  )
}
