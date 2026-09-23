import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tests } from '../data/tests/sample'
import { aiTests } from '../data/tests/rewind'
import { getNickname } from '../lib/identity'
import { latestResult } from '../lib/lastResult'
import { listPersons } from '../services/personService'
import { listEntitlements, PRODUCTS } from '../services/purchaseService'
import PriceTag from '../components/PriceTag'
import TabBar from '../components/TabBar'

export default function Home() {
  const [persons, setPersons] = useState([])
  const [unlocked, setUnlocked] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([listPersons().catch(() => []), listEntitlements().catch(() => [])]).then(([p, u]) => {
      setPersons(p)
      setUnlocked(u)
      setLoaded(true)
    })
  }, [])

  const meResult = latestResult('ME')
  const nowResult = latestResult('NOW')
  const afterResult = latestResult('AFTER')
  const somCount = persons.filter((p) => p.relationship_label === '썸').length
  const lover = persons.find((p) => p.relationship_label === '연인')

  return (
    <div className="page page-dashboard">
      <div className="dash-hero">
        <span className="eyebrow">REPORT DASHBOARD</span>
        <h1>{getNickname() ? `${getNickname()}님의 연애 대시보드` : '나의 연애 대시보드'}</h1>
        <p>지금까지 알아낸 나, 그리고 앞으로 알아볼 수 있는 것들이에요.</p>
      </div>

      <div className="section-label">나를 알아보기</div>
      <div className="card-grid">
        <ProductCard
          icon="💗"
          name="ME · 나의 연애스타일"
          desc="핵심 연애 지표와 사랑을 주고받는 방식"
          to={meResult ? `/me/result/${meResult.id}` : '/me/start'}
          state={meResult ? <span className="state done">완료</span> : <span className="state todo">시작하기</span>}
        />
        <ProductCard
          icon="🧭"
          name="MATCH · 나와 잘 맞는 사람"
          desc="ME 데이터로 바로 확인 가능, 추가 질문 없음"
          to={meResult ? '/match' : '/me/start'}
          disabledHint={meResult ? null : 'ME를 먼저 완료해주세요'}
          state={
            unlocked.includes('MATCH_FULL') ? (
              <span className="state done">완료</span>
            ) : (
              <PriceTag list={PRODUCTS.MATCH_FULL.list} sale={PRODUCTS.MATCH_FULL.sale} />
            )
          }
        />
      </div>

      <div className="section-label">누군가 마음에 있다면</div>
      <div className="card-grid">
        <ProductCard
          icon="➕"
          name="사람 추가"
          desc="썸 · 연인 · 전 연인 (최대 3명)"
          to="/people"
          state={<span className="state new">{loaded ? `${persons.length}/3` : '…'}</span>}
        />
        <ProductCard
          icon="🔍"
          name="CRUSH · 누구와 어떤 연애가 될까"
          desc="썸 상대들과 각각 비교"
          to="/crush"
          disabledHint={somCount === 0 ? '썸 상대를 먼저 추가해주세요' : null}
          state={
            unlocked.includes('CRUSH') ? (
              <span className="state done">완료</span>
            ) : (
              <PriceTag list={PRODUCTS.CRUSH.list} sale={PRODUCTS.CRUSH.sale} />
            )
          }
        />
      </div>

      <div className="section-label">연애 중이라면</div>
      <div className="card-grid">
        <ProductCard
          icon="🤝"
          name="PAIR · 우리 둘 궁합"
          desc={lover ? `${lover.display_name}님과의 실제 궁합 분석` : '연인을 등록하면 바로 분석돼요'}
          to="/pair"
          disabledHint={lover ? null : '연인을 먼저 추가해주세요'}
          state={
            unlocked.includes('PAIR') ? (
              <span className="state done">완료</span>
            ) : (
              <PriceTag list={PRODUCTS.PAIR.list} sale={PRODUCTS.PAIR.sale} />
            )
          }
        />
        <ProductCard
          icon="🌦️"
          name="NOW · 요즘 우리 왜 이럴까"
          desc="권태기 · 갈등 · 거리두기 정밀진단"
          to={nowResult ? `/now/result/${nowResult.id}` : '/now/start'}
          state={nowResult ? <span className="state done">완료</span> : <span className="state todo">시작하기</span>}
        />
      </div>

      <div className="section-label">헤어진 뒤라면</div>
      <div className="card-grid">
        <ProductCard
          icon="🕯️"
          name="AFTER · 이별·재결합 심층분석"
          desc="내 마음과 상대 신호를 함께 분석"
          to={afterResult ? `/after/result/${afterResult.id}` : '/after/start'}
          state={
            afterResult ? <span className="state done">완료</span> : <span className="state todo">시작하기</span>
          }
        />
      </div>

      <Link to="/folder" className="folder-link">
        <div>
          <div className="folder-link-title">📁 내 리포트함</div>
          <div className="folder-link-sub">완료한 리포트 모아보기</div>
        </div>
        <span>›</span>
      </Link>

      <div className="section-label" style={{ marginTop: 32 }}>
        그 외 테스트
      </div>
      <ul className="test-list">
        {Object.values(aiTests).map((t) => (
          <li key={t.slug}>
            <Link to={`/ai-test/${t.slug}`}>{t.title}</Link>
          </li>
        ))}
        {Object.values(tests).map((t) => (
          <li key={t.slug}>
            <Link to={`/test/${t.slug}`}>{t.title}</Link>
          </li>
        ))}
      </ul>

      <TabBar />
    </div>
  )
}

function ProductCard({ icon, name, desc, to, state, disabledHint }) {
  return (
    <Link to={to} className="prod-card" title={disabledHint || undefined}>
      <div className="prod-card-icon">{icon}</div>
      <div className="prod-card-body">
        <div className="prod-card-name">{name}</div>
        <div className="prod-card-desc">{disabledHint || desc}</div>
      </div>
      <div className="prod-card-state">{state}</div>
    </Link>
  )
}
