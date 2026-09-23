import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getMeResult } from '../services/assessmentService'
import { computePair, pairTypeLabel, coupleGuide as buildCoupleGuide } from '../services/mePairEngine'
import { computeImpact } from '../services/impactEngine'
import { findMisreads } from '../services/misreadEngine'
import { listPersons, latestMeAssessmentForPerson } from '../services/personService'
import { latestResult } from '../lib/lastResult'
import { isUnlocked, PRODUCTS } from '../services/purchaseService'
import PriceTag from '../components/PriceTag'
import PurchaseSheet from '../components/PurchaseSheet'

function toScoreMap(scores) {
  return Object.fromEntries(scores.map((s) => [s.dimension_key, s.normalized_score]))
}

const FREE_CATEGORIES = 2

export default function MePair() {
  const [params, setParams] = useSearchParams()
  const [codeA, setCodeA] = useState(params.get('a') ?? latestResult('ME')?.id ?? '')
  const [codeB, setCodeB] = useState(params.get('b') ?? '')
  const [loverName, setLoverName] = useState('')
  const [pair, setPair] = useState(null)
  const [impact, setImpact] = useState(null)
  const [misreads, setMisreads] = useState([])
  const [guide, setGuide] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [showSheet, setShowSheet] = useState(false)

  useEffect(() => {
    isUnlocked('PAIR').then(setUnlocked)
    // 등록된 '연인'이 있으면 코드를 직접 안 넣어도 자동으로 불러온다.
    listPersons().then(async (persons) => {
      const lover = persons.find((p) => p.relationship_label === '연인')
      if (!lover || codeB) return
      const assessmentId = await latestMeAssessmentForPerson(lover.id)
      if (assessmentId) {
        setLoverName(lover.display_name)
        setCodeB(assessmentId)
        load(codeA, assessmentId)
      }
    })
    if (params.get('a') && params.get('b')) load(params.get('a'), params.get('b'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load(a, b) {
    setError('')
    setPair(null)
    setLoading(true)
    try {
      const [resA, resB] = await Promise.all([getMeResult(a), getMeResult(b)])
      if (!resA || !resB) return setError('결과 코드를 찾을 수 없어요.')
      if (resA.assessment.product_type !== 'ME' || resB.assessment.product_type !== 'ME') {
        return setError('나의 연애 성향 테스트 결과끼리만 궁합을 볼 수 있어요.')
      }
      const scoresA = toScoreMap(resA.scores)
      const scoresB = toScoreMap(resB.scores)
      setPair({ ...computePair(scoresA, scoresB), typeLabel: pairTypeLabel(scoresA, scoresB) })
      setImpact(computeImpact(scoresA, scoresB))
      setMisreads(findMisreads(scoresA, scoresB, '나', loverName || '상대'))
      setGuide(buildCoupleGuide(scoresA, scoresB))
    } catch {
      setError('궁합을 불러오는 중 문제가 생겼어요.')
    } finally {
      setLoading(false)
    }
  }

  function submit(e) {
    e.preventDefault()
    setParams({ a: codeA, b: codeB })
    load(codeA, codeB)
  }

  const visibleCategories = pair ? (unlocked ? pair.categories : pair.categories.slice(0, FREE_CATEGORIES)) : []

  return (
    <div className="page page-me-pair">
      <h1>우리 궁합</h1>
      <p className="sub">
        {loverName
          ? `${loverName}님과의 실제 궁합이에요.`
          : "각자 '나의 연애 성향' 테스트를 하고, 결과 코드 두 개를 넣어주세요."}
      </p>

      {!loverName && (
        <form onSubmit={submit} className="compat-form">
          <input placeholder="내 결과 코드" value={codeA} onChange={(e) => setCodeA(e.target.value)} />
          <input placeholder="상대 결과 코드" value={codeB} onChange={(e) => setCodeB(e.target.value)} />
          <button type="submit" disabled={loading}>
            {loading ? '계산 중…' : '궁합 보기'}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {pair && (
        <div className="pair-result">
          <div className="compat-score">{pair.overallScore}</div>
          {pair.typeLabel && <div className="pair-type">{pair.typeLabel}</div>}

          <div className="section-label">카테고리별 궁합</div>
          <div className="folded-list">
            {visibleCategories.map((c) => (
              <div className="metric-row" key={c.category}>
                <div className="metric-label">{c.category}</div>
                <div className="metric-bar">
                  <div style={{ width: `${c.score}%` }} />
                </div>
                <div className="metric-val">{c.score}</div>
              </div>
            ))}
          </div>

          {pair.frictions.length > 0 && (
            <>
              <h2 className="section-title">충돌할 가능성이 있는 부분</h2>
              <ul className="pair-list">
                {pair.frictions.map((f) => (
                  <li key={f.label}>
                    <div>{f.label}</div>
                    <p className="pair-friction">{f.detail}</p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {!unlocked && (
            <div className="price-block">
              <PriceTag list={PRODUCTS.PAIR.list} sale={PRODUCTS.PAIR.sale} />
              <button className="btn-primary" onClick={() => setShowSheet(true)}>
                PAIR 전체 리포트 잠금 해제
              </button>
              <p className="sheet-note">
                비대칭 영향, 해석 차이, 커플 사용설명서, 나머지 카테고리는 잠금 해제 후 볼 수 있어요.
              </p>
            </div>
          )}

          {unlocked && impact && (
            <>
              <div className="section-label">A가 B에게, B가 A에게 미치는 영향</div>
              <div className="impact-cols">
                <div className="impact-col">
                  <h4>내가 {loverName || '상대'}에게</h4>
                  {impact.aToB.map((it, i) => (
                    <div className="impact-item" key={i}>
                      <span>{it.label}</span>
                      <span className={'impact-val ' + (it.value > 0 ? 'pos' : 'neg')}>
                        {it.value > 0 ? '+' : ''}
                        {it.value}
                      </span>
                    </div>
                  ))}
                  {impact.aToB.length === 0 && <p className="sub">뚜렷한 영향 신호가 없어요.</p>}
                </div>
                <div className="impact-col">
                  <h4>{loverName || '상대'}이 나에게</h4>
                  {impact.bToA.map((it, i) => (
                    <div className="impact-item" key={i}>
                      <span>{it.label}</span>
                      <span className={'impact-val ' + (it.value > 0 ? 'pos' : 'neg')}>
                        {it.value > 0 ? '+' : ''}
                        {it.value}
                      </span>
                    </div>
                  ))}
                  {impact.bToA.length === 0 && <p className="sub">뚜렷한 영향 신호가 없어요.</p>}
                </div>
              </div>
            </>
          )}

          {unlocked && misreads.length > 0 && (
            <>
              <div className="section-label">같은 행동, 다른 해석</div>
              {misreads.map((m) => (
                <div className="friction-card" key={m.dimension}>
                  <div className="friction-card-title">{m.action}의 의미 차이</div>
                  <p>
                    {m.highSide}: {m.action} = {m.highMeaning}
                    <br />
                    {m.lowSide}: {m.action} = {m.lowMeaning}
                  </p>
                </div>
              ))}
            </>
          )}

          {unlocked && guide.length > 0 && (
            <>
              <div className="section-label">우리 커플 사용설명서</div>
              <div className="folded-list">
                {guide.map((g) => (
                  <div className="folded-item" key={g.label}>
                    <div className="folded-name">{g.label}</div>
                    <div className="folded-date">{g.tip}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Link to="/" className="link-secondary">
        ← 홈으로
      </Link>

      <PurchaseSheet
        product={showSheet ? { ...PRODUCTS.PAIR } : null}
        onClose={() => setShowSheet(false)}
        onPurchased={() => setUnlocked(true)}
      />
    </div>
  )
}
