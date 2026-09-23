import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LikertTest from '../components/LikertTest'
import observedQuestionBank from '../data/questions/me.observed.v1.json'
import { submitObservedAssessment } from '../services/assessmentService'
import { getPerson } from '../services/personService'

export default function PersonObservedTest() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const [person, setPerson] = useState(null)
  const [error, setError] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    getPerson(personId)
      .then((p) => (p ? setPerson(p) : setError(true)))
      .catch(() => setError(true))
  }, [personId])

  if (error) return <div className="page">사람을 찾을 수 없어요.</div>
  if (!person) return <div className="page">불러오는 중…</div>

  const onSubmit = (responses) => submitObservedAssessment(responses, personId)

  if (started) {
    return (
      <LikertTest
        questionBank={observedQuestionBank}
        onSubmit={onSubmit}
        resultPathPrefix="/me/result"
        nameToken={person.display_name}
      />
    )
  }

  return (
    <div className="page page-invite-intro">
      <span className="eyebrow">관찰 기반 프로필</span>
      <h1 style={{ margin: '10px 0' }}>{person.display_name}님에 대해 답해주세요</h1>
      <p className="sub">
        {person.display_name}님이 직접 답한 게 아니라, 내가 관찰한 행동을 바탕으로 추정하는 프로필이에요. 24문항,
        2분 정도 걸려요.
      </p>
      <button className="btn-primary" onClick={() => setStarted(true)}>
        시작하기
      </button>
      <button className="btn-ghost" onClick={() => navigate('/people')}>
        나중에 할게요
      </button>
    </div>
  )
}
