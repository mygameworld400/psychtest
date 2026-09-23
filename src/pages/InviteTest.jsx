import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LikertTest from '../components/LikertTest'
import meQuestionBank from '../data/questions/me.v1.json'
import { submitMeAssessment } from '../services/assessmentService'
import { resolveInvite, markInviteUsed } from '../services/personService'

export default function InviteTest() {
  const { token } = useParams()
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    resolveInvite(token)
      .then((r) => (r ? setInvite(r) : setError(true)))
      .catch(() => setError(true))
  }, [token])

  if (error) return <div className="page">유효하지 않거나 이미 사용된 링크예요.</div>
  if (!invite) return <div className="page">불러오는 중…</div>

  if (invite.used_at) {
    return <div className="page">이 링크는 이미 사용됐어요. 요청한 사람에게 새 링크를 받아주세요.</div>
  }

  if (started) {
    return <LikertTest questionBank={meQuestionBank} onSubmit={onSubmit} resultPathPrefix="/me/result" />
  }

  async function onSubmit(responses) {
    const result = await submitMeAssessment(responses, { personId: invite.person_id })
    await markInviteUsed(token)
    return result
  }

  return (
    <div className="page page-invite-intro">
      <span className="eyebrow">ME · 나의 연애스타일</span>
      <h1 style={{ margin: '10px 0' }}>
        <b>{invite.display_name}</b>님이 요청한 테스트예요
      </h1>
      <p className="sub">솔직하게 답해주실수록 더 정확한 결과가 나와요. 5분 정도 걸려요.</p>
      <button className="btn-primary" onClick={() => setStarted(true)}>
        시작하기
      </button>
    </div>
  )
}
