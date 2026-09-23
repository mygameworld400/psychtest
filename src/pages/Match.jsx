import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { latestResult } from '../lib/lastResult'
import { getAssessmentResult } from '../services/assessmentService'
import { computeMatch } from '../services/matchEngine'
import { isUnlocked, PRODUCTS } from '../services/purchaseService'
import PriceTag from '../components/PriceTag'
import PurchaseSheet from '../components/PurchaseSheet'

const FREE_PREVIEW = 2

export default function Match() {
  const meId = latestResult('ME')?.id
  const [sections, setSections] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!meId) return
    Promise.all([getAssessmentResult(meId), isUnlocked('MATCH_FULL')])
      .then(([result, ok]) => {
        if (!result) return setError(true)
        const scoreMap = Object.fromEntries(result.scores.map((s) => [s.dimension_key, s.normalized_score]))
        setSections(computeMatch(scoreMap))
        setUnlocked(ok)
      })
      .catch(() => setError(true))
  }, [meId])

  if (!meId) return <Navigate to="/me/start" replace />
  if (error) return <div className="page">결과를 불러오지 못했어요.</div>
  if (!sections) return <div className="page">불러오는 중…</div>

  const visible = unlocked ? sections : sections.slice(0, FREE_PREVIEW)

  return (
    <div className="page page-match">
      <span className="eyebrow">나와 잘 맞는 사람</span>
      <h1 style={{ margin: '8px 0 4px' }}>당신에게 맞는 연애 상대</h1>
      <p className="sub">ME에서 계산된 핵심 연애수치로 바로 분석했어요. 추가 질문은 없어요.</p>

      <div className="match-sections">
        {visible.map((s, i) => (
          <div className="compare-card" key={s.title}>
            <div className="compare-card-who">
              {String(i + 1).padStart(2, '0')}. {s.title}
            </div>
            <p className="compare-card-note">{s.text}</p>
          </div>
        ))}
        {!unlocked && (
          <div className="compare-card locked-card">
            <div className="compare-card-who">
              {String(FREE_PREVIEW + 1).padStart(2, '0')}~10. 나머지 {sections.length - FREE_PREVIEW}개 섹션
            </div>
            <p className="compare-card-note">전체 리포트를 열면 나머지 섹션이 모두 공개돼요.</p>
          </div>
        )}
      </div>

      {!unlocked && (
        <div className="price-block">
          <PriceTag list={PRODUCTS.MATCH_FULL.list} sale={PRODUCTS.MATCH_FULL.sale} />
          <button className="btn-primary" onClick={() => setShowSheet(true)}>
            MATCH 전체 리포트 잠금 해제
          </button>
        </div>
      )}

      <Link to="/" className="link-secondary">
        ← 홈으로
      </Link>

      <PurchaseSheet
        product={showSheet ? { ...PRODUCTS.MATCH_FULL } : null}
        onClose={() => setShowSheet(false)}
        onPurchased={() => setUnlocked(true)}
      />
    </div>
  )
}
