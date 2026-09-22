import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { tests } from '../data/tests/sample'
import { scoreAnswers } from '../services/testEngine'
import { saveResult } from '../services/resultService'

export default function Test() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const test = tests[slug]
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  if (!test) return <div className="page">테스트를 찾을 수 없어요.</div>

  const question = test.questions[step]

  async function choose(optionIndex) {
    const nextAnswers = [...answers, { questionId: question.id, optionIndex }]
    if (step + 1 < test.questions.length) {
      setAnswers(nextAnswers)
      setStep(step + 1)
      return
    }
    setSaving(true)
    setSaveError(false)
    const resultType = scoreAnswers(test, nextAnswers)
    try {
      const id = await saveResult({ testSlug: test.slug, resultType, answers: nextAnswers })
      navigate(`/result/${id}`)
    } catch {
      setSaving(false)
      setSaveError(true)
    }
  }

  if (saving) return <div className="page">결과 계산 중…</div>

  return (
    <div className="page page-test">
      <div className="progress">
        {step + 1} / {test.questions.length}
      </div>
      <h2>{question.text}</h2>
      <div className="options">
        {question.options.map((opt, i) => (
          <button key={i} onClick={() => choose(i)}>
            {opt.text}
          </button>
        ))}
      </div>
      {saveError && <p className="error">결과 저장에 실패했어요. 다시 시도해주세요.</p>}
    </div>
  )
}
