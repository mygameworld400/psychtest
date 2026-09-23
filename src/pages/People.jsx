import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createPerson, deletePerson, listPersons, MAX_PERSONS } from '../services/personService'
import TabBar from '../components/TabBar'

const RELATIONS = ['썸', '연인', '전 연인']
const MODE_LABEL = { direct: '본인 직접 응답', observed: '관찰 기반 추정' }

export default function People() {
  const navigate = useNavigate()
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [inviteLink, setInviteLink] = useState(null)

  const [name, setName] = useState('')
  const [relation, setRelation] = useState('썸')
  const [mode, setMode] = useState('direct')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function reload() {
    setLoading(true)
    listPersons()
      .then(setPersons)
      .catch(() => setError('사람 목록을 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      const { person, inviteToken } = await createPerson({ displayName: name, relationshipLabel: relation, mode })
      setPersons((prev) => [...prev, person])
      setName('')
      if (inviteToken) {
        setInviteLink(`${location.origin}${location.pathname}#/invite/${inviteToken}`)
      } else {
        navigate(`/people/${person.id}/observed`)
      }
    } catch (err) {
      setError(err.message || '추가에 실패했어요.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    await deletePerson(id).catch(() => {})
    setPersons((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="page page-people">
      <h1>사람 관리</h1>
      <p className="sub">
        썸 · 연인 · 전 연인을 등록하면 CRUSH · PAIR 분석에 바로 쓸 수 있어요. 최대 {MAX_PERSONS}명까지 추가할 수
        있어요 ({loading ? '…' : persons.length}/{MAX_PERSONS}).
      </p>

      {!loading && (
        <div className="people-list">
          {persons.map((p) => (
            <div className="person-card" key={p.id}>
              <div className="avatar">{p.display_name[0]}</div>
              <div className="person-card-body">
                <div className="person-card-name">{p.display_name}</div>
                <div className="person-card-tag">{p.relationship_label}</div>
              </div>
              <span className={'badge ' + p.response_mode}>{MODE_LABEL[p.response_mode] ?? p.response_mode}</span>
              <button className="person-remove" onClick={() => remove(p.id)} aria-label="삭제">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {inviteLink && (
        <div className="sheet-note invite-note">
          직접 테스트 링크가 만들어졌어요. 상대에게 이 링크를 보내주세요.
          <div className="invite-link-row">
            <code>{inviteLink}</code>
            <button
              className="btn-ghost"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink)
              }}
            >
              복사
            </button>
          </div>
          <button className="btn-primary" onClick={() => setInviteLink(null)}>
            확인
          </button>
        </div>
      )}

      {!showForm && !inviteLink && persons.length < MAX_PERSONS && (
        <button className="add-person-btn" onClick={() => setShowForm(true)}>
          + 사람 추가하기
        </button>
      )}

      {showForm && (
        <form className="person-form" onSubmit={submit}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 (별칭)" maxLength={20} />

          <div className="chip-row">
            {RELATIONS.map((r) => (
              <button
                type="button"
                key={r}
                className={'chip' + (relation === r ? ' on' : '')}
                onClick={() => setRelation(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="mode-choice">
            <button
              type="button"
              className={'mode-card' + (mode === 'direct' ? ' on' : '')}
              onClick={() => setMode('direct')}
            >
              <div className="mode-card-title">직접 테스트</div>
              <div className="mode-card-desc">링크를 보내면 상대가 직접 응답해요 (가장 정확)</div>
            </button>
            <button
              type="button"
              className={'mode-card' + (mode === 'observed' ? ' on' : '')}
              onClick={() => setMode('observed')}
            >
              <div className="mode-card-title">관찰 기반</div>
              <div className="mode-card-desc">테스트할 수 없을 때, 내가 본 행동으로 추정해요</div>
            </button>
          </div>

          <button className="btn-primary" type="submit" disabled={saving || !name.trim()}>
            {saving ? '추가하는 중…' : '추가하기'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
            취소
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      <div className="sheet-note">
        직접 테스트: 상대에게 링크를 보내면 본인이 직접 질문에 답해요 (가장 정확).
        <br />
        관찰 기반: 상대가 테스트할 수 없을 때, 내가 본 행동을 바탕으로 추정 프로필을 만들어요.
      </div>

      <Link to="/" className="link-secondary">
        ← 홈으로
      </Link>
      <TabBar />
    </div>
  )
}
