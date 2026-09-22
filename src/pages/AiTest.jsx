import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { aiTests } from '../data/tests/rewind'
import { requestAnalysis } from '../services/aiAnalysisService'
import { saveAiResult } from '../services/resultService'

export default function AiTest() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const test = aiTests[slug]
  const [step, setStep] = useState(0)
  const [choiceKey, setChoiceKey] = useState(null)
  const [reason, setReason] = useState('')
  const [answers, setAnswers] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(false)

  if (!test) return <div className="page">테스트를 찾을 수 없어요.</div>

  const item = test.items[step]

  async function submit() {
    const choice = item.choices.find((c) => c.key === choiceKey)
    const nextAnswers = [
      ...answers,
      { question: item.question, choiceKey, choiceText: choice.text, reason },
    ]

    if (step + 1 < test.items.length) {
      setAnswers(nextAnswers)
      setChoiceKey(null)
      setReason('')
      setStep(step + 1)
      return
    }

    setAnalyzing(true)
    setError(false)
    try {
      const analysis = await requestAnalysis({
        testTitle: test.title,
        items: nextAnswers.map((a) => ({
          question: a.question,
          choiceText: a.choiceText,
          reason: a.reason,
        })),
      })
      const id = await saveAiResult({ testSlug: test.slug, answers: nextAnswers, analysis })
      navigate(`/result/${id}`)
    } catch {
      setAnalyzing(false)
      setError(true)
    }
  }

  if (analyzing) {
    return (
      <div className="page page-analyzing">
        <p>AI가 답변을 읽고 있어요…</p>
      </div>
    )
  }

  return (
    <div className="page page-ai-test">
      {step === 0 && (
        <>
          <h1>{test.title}</h1>
          <p className="intro">{test.intro}</p>
          <p className="warning">{test.warning}</p>
        </>
      )}

      <h2>{item.question}</h2>
      <div className="choices">
        {item.choices.map((c) => (
          <button
            key={c.key}
            className={choiceKey === c.key ? 'choice selected' : 'choice'}
            onClick={() => setChoiceKey(c.key)}
          >
            <b>{c.key}.</b> {c.text}
          </button>
        ))}
      </div>

      {choiceKey && (
        <div className="reason-box">
          <label htmlFor="reason">{item.reasonPrompt}</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="왜 그렇게 생각했는지 적어줘"
            rows={4}
          />
          <button className="submit" disabled={!reason.trim()} onClick={submit}>
            {step + 1 < test.items.length ? '다음' : '분석 시작'}
          </button>
        </div>
      )}

      {error && <p className="error">분석에 실패했어요. 다시 시도해주세요.</p>}
    </div>
  )
}
