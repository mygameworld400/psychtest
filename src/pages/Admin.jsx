import { useEffect, useState } from 'react'
import { isAdmin, tryAdminLogin } from '../lib/identity'
import { supabase } from '../lib/supabase'
import { PRODUCTS } from '../services/purchaseService'

export default function Admin() {
  const [unlocked, setUnlocked] = useState(isAdmin())
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (tryAdminLogin(code)) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (!unlocked) {
    return (
      <div className="page page-admin-gate">
        <h1>관리자 코드</h1>
        <p className="sub">관리자 페이지는 코드로만 열려요. 실제 서버 인증이 아니라 화면을 숨겨두는 수준이에요.</p>
        <form onSubmit={submit} className="onboarding-form">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="관리자 코드"
            autoFocus
          />
          <button className="btn-primary" type="submit">
            입장
          </button>
        </form>
        {error && <p className="error">코드가 맞지 않아요.</p>}
      </div>
    )
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const [purchases, setPurchases] = useState(null)
  const [assessmentCounts, setAssessmentCounts] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setLoadError(true)
      return
    }
    Promise.all([
      supabase.from('pt_purchases').select('product_sku, amount, status, created_at').order('created_at', { ascending: false }),
      supabase.from('pt_assessments').select('product_type'),
    ])
      .then(([p, a]) => {
        if (p.error || a.error) throw p.error || a.error
        setPurchases(p.data ?? [])
        const counts = {}
        for (const row of a.data ?? []) counts[row.product_type] = (counts[row.product_type] ?? 0) + 1
        setAssessmentCounts(counts)
      })
      .catch(() => setLoadError(true))
  }, [])

  if (loadError) return <div className="page">데이터를 불러오지 못했어요.</div>
  if (!purchases || !assessmentCounts) return <div className="page">불러오는 중…</div>

  const paid = purchases.filter((p) => p.status === 'paid')
  const revenue = paid.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="page page-admin">
      <h1>관리자</h1>
      <div className="admin-stat-grid">
        <div className="admin-stat">
          <div className="admin-stat-label">누적 매출</div>
          <div className="admin-stat-value">{revenue.toLocaleString()}원</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">결제 건수</div>
          <div className="admin-stat-value">{paid.length}건</div>
        </div>
      </div>

      <div className="section-label">상품별 완료 테스트</div>
      <div className="folded-list">
        {Object.entries(assessmentCounts).map(([type, count]) => (
          <div key={type} className="folded-item">
            <div className="folded-name">{type}</div>
            <div className="folded-date">{count}건</div>
          </div>
        ))}
      </div>

      <div className="section-label">최근 구매</div>
      <div className="folded-list">
        {purchases.slice(0, 20).map((p, i) => (
          <div key={i} className="folded-item">
            <div className="folded-name">{PRODUCTS[p.product_sku]?.name ?? p.product_sku}</div>
            <div className="folded-date">
              {p.amount.toLocaleString()}원 · {new Date(p.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>
        ))}
        {purchases.length === 0 && <p className="sub">아직 구매 내역이 없어요.</p>}
      </div>
    </div>
  )
}
