import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listPersons } from '../services/personService'
import TabBar from '../components/TabBar'

export default function Crush() {
  const navigate = useNavigate()
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])

  useEffect(() => {
    listPersons()
      .then((all) => setPersons(all.filter((p) => p.relationship_label === '썸')))
      .finally(() => setLoading(false))
  }, [])

  function toggle(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="page page-crush">
      <span className="eyebrow">누구와 어떤 연애가 될까</span>
      <h1 style={{ margin: '8px 0 16px' }}>비교할 상대를 골라주세요</h1>

      {loading && <p className="sub">불러오는 중…</p>}

      {!loading && persons.length === 0 && (
        <div className="sheet-note">
          아직 등록된 썸 상대가 없어요.
          <br />
          <Link to="/people" className="link-secondary">
            사람 추가하러 가기 →
          </Link>
        </div>
      )}

      <div className="people-list">
        {persons.map((p) => (
          <div key={p.id} className={'select-row' + (selected.includes(p.id) ? ' checked' : '')} onClick={() => toggle(p.id)}>
            <div className="checkbox">{selected.includes(p.id) ? '✓' : ''}</div>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
              {p.display_name[0]}
            </div>
            <div className="person-card-body">
              <div className="person-card-name">{p.display_name}</div>
              <div className="person-card-tag">{p.response_mode === 'direct' ? '본인 직접 응답' : '관찰 기반 추정'}</div>
            </div>
          </div>
        ))}
      </div>

      {persons.length > 0 && (
        <button
          className="btn-primary"
          disabled={selected.length === 0}
          onClick={() => navigate(`/crush/result?ids=${selected.join(',')}`)}
        >
          선택한 {selected.length}명과 비교하기
        </button>
      )}

      <Link to="/" className="link-secondary">
        ← 홈으로
      </Link>
      <TabBar />
    </div>
  )
}
