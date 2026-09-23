import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { latestResult } from '../lib/lastResult'
import { getAssessmentResult } from '../services/assessmentService'
import { getPerson, latestMeAssessmentForPerson } from '../services/personService'
import { computePair } from '../services/mePairEngine'
import { isUnlocked, PRODUCTS } from '../services/purchaseService'
import PriceTag from '../components/PriceTag'
import PurchaseSheet from '../components/PurchaseSheet'

const SHOWN_CATEGORIES = ['연락 궁합', '감정 궁합', '신뢰 기준 궁합', '개인공간 궁합', '관계 회복력']

function noteFor(score) {
  if (score >= 80) return '정말 잘 맞는 조합이에요. 어디서든 자연스럽게 맞춰질 가능성이 높아요.'
  if (score >= 65) return '전반적으로 잘 맞는 편이에요. 몇몇 지점만 맞추면 편안한 관계가 될 수 있어요.'
  if (score >= 45) return '잘 맞는 부분과 부딪힐 부분이 함께 있어요. 서로 다른 점을 알아가는 재미가 있을 수 있어요.'
  return '많은 부분에서 서로 다르게 반응해요. 그만큼 새로운 자극이 될 수도 있어요.'
}

export default function CrushResult() {
  const [params] = useSearchParams()
  const ids = (params.get('ids') || '').split(',').filter(Boolean)
  const myId = latestResult('ME')?.id

  const [entries, setEntries] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!myId || ids.length === 0) return
    Promise.all([getAssessmentResult(myId), isUnlocked('CRUSH')])
      .then(async ([myResult, ok]) => {
        if (!myResult) return setError(true)
        const myScores = Object.fromEntries(myResult.scores.map((s) => [s.dimension_key, s.normalized_score]))

        const built = await Promise.all(
          ids.map(async (id) => {
            const person = await getPerson(id)
            const assessmentId = await latestMeAssessmentForPerson(id)
            if (!assessmentId) return { person, pending: true }
            const result = await getAssessmentResult(assessmentId)
            const theirScores = Object.fromEntries(result.scores.map((s) => [s.dimension_key, s.normalized_score]))
            return { person, pair: computePair(myScores, theirScores) }
          }),
        )
        setEntries(built)
        setUnlocked(ok)
      })
      .catch(() => setError(true))
  }, [myId, ids.join(',')])

  if (!myId) return <div className="page">ME 테스트를 먼저 완료해주세요.</div>
  if (error) return <div className="page">결과를 불러오지 못했어요.</div>
  if (!entries) return <div className="page">불러오는 중…</div>

  const ready = entries.filter((e) => !e.pending)
  const visible = unlocked ? ready : ready.slice(0, 1)

  const bestOverall = ready.length ? ready.reduce((a, b) => (b.pair.overallScore > a.pair.overallScore ? b : a)) : null

  return (
    <div className="page page-crush-result">
      <span className="eyebrow">CRUSH 비교 결과</span>
      <h1 style={{ margin: '8px 0 16px' }}>누구와 어떤 연애가 될까</h1>

      {entries.some((e) => e.pending) && (
        <p className="sub">
          {entries.filter((e) => e.pending).map((e) => e.person.display_name).join(', ')}님은 아직 응답을 기다리고
          있어요.
        </p>
      )}

      {visible.map(({ person, pair }) => (
        <div className="compare-card" key={person.id}>
          <div className="compare-card-who">나 × {person.display_name}</div>
          {SHOWN_CATEGORIES.map((cat) => {
            const row = pair.categories.find((c) => c.category === cat)
            if (!row) return null
            return (
              <div className="metric-row" key={cat}>
                <div className="metric-label">{cat.replace(' 궁합', '')}</div>
                <div className="metric-bar">
                  <div style={{ width: `${row.score}%` }} />
                </div>
                <div className="metric-val">{row.score}</div>
              </div>
            )
          })}
          <p className="compare-card-note">{noteFor(pair.overallScore)}</p>
        </div>
      ))}

      {!unlocked && ready.length > 1 && (
        <div className="compare-card locked-card">
          <div className="compare-card-who">나머지 {ready.length - 1}명 비교</div>
          <p className="compare-card-note">CRUSH를 잠금 해제하면 선택한 모든 상대와의 비교를 볼 수 있어요.</p>
        </div>
      )}

      {unlocked && bestOverall && (
        <>
          <div className="section-label">항목별 비교</div>
          <div className="folded-list">
            <div className="folded-item">
              <div className="folded-name">가장 안정적인 상대</div>
              <div className="folded-date">{bestOverall.person.display_name}</div>
            </div>
          </div>
        </>
      )}

      {!unlocked && (
        <div className="price-block">
          <PriceTag list={PRODUCTS.CRUSH.list} sale={PRODUCTS.CRUSH.sale} />
          <button className="btn-primary" onClick={() => setShowSheet(true)}>
            CRUSH 잠금 해제
          </button>
        </div>
      )}

      <p className="crush-disclaimer">
        CRUSH는 누구와 사귀어야 할지 대신 결정하지 않아요. 차이를 보여드릴 뿐, 선택은 당신의 몫이에요.
      </p>

      <Link to="/crush" className="link-secondary">
        ← 다시 고르기
      </Link>

      <PurchaseSheet
        product={showSheet ? { ...PRODUCTS.CRUSH } : null}
        onClose={() => setShowSheet(false)}
        onPurchased={() => setUnlocked(true)}
      />
    </div>
  )
}
