import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listResults } from '../lib/lastResult'
import { listPurchases, PRODUCTS } from '../services/purchaseService'
import TabBar from '../components/TabBar'

const PRODUCT_LABEL = { ME: 'ME 리포트', NOW: 'NOW 리포트', AFTER: 'AFTER 리포트' }
const RESULT_PATH = { ME: '/me/result', NOW: '/now/result', AFTER: '/after/result' }

export default function ReportFolder() {
  const [purchases, setPurchases] = useState(null)

  useEffect(() => {
    listPurchases()
      .then(setPurchases)
      .catch(() => setPurchases([]))
  }, [])

  const results = listResults()

  return (
    <div className="page page-folder">
      <h1>내 리포트함</h1>
      <p className="sub">이 브라우저에서 완료한 리포트예요. 다른 기기에서는 보이지 않아요.</p>

      <div className="section-label">완료한 테스트</div>
      <div className="folded-list">
        {results.map((r) => (
          <Link className="folded-item" key={r.id} to={`${RESULT_PATH[r.productType] ?? '/result'}/${r.id}`}>
            <div className="folded-name">{PRODUCT_LABEL[r.productType] ?? r.productType}</div>
            <div className="folded-date">{new Date(r.completedAt).toLocaleDateString('ko-KR')}</div>
          </Link>
        ))}
        {results.length === 0 && <p className="sub">아직 완료한 테스트가 없어요.</p>}
      </div>

      <div className="section-label">구매 내역</div>
      <div className="folded-list">
        {purchases === null && <p className="sub">불러오는 중…</p>}
        {purchases?.map((p, i) => (
          <div className="folded-item" key={i}>
            <div className="folded-name">{PRODUCTS[p.product_sku]?.name ?? p.product_sku}</div>
            <div className="folded-date">
              {p.amount.toLocaleString()}원 · {new Date(p.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>
        ))}
        {purchases?.length === 0 && <p className="sub">아직 구매 내역이 없어요.</p>}
      </div>

      <Link to="/" className="link-secondary">
        ← 홈으로
      </Link>
      <TabBar />
    </div>
  )
}
