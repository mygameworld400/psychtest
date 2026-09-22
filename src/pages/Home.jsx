import { Link } from 'react-router-dom'
import { tests } from '../data/tests/sample'
import { aiTests } from '../data/tests/rewind'

export default function Home() {
  return (
    <div className="page page-home">
      <h1>심리테스트</h1>
      <p>테스트하고 결과 링크로 친구·커플이랑 궁합도 확인해보세요.</p>
      <ul className="test-list">
        <li>
          <Link to="/me/start">나의 연애 성향 (정밀 분석)</Link>
        </li>
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
      <Link to="/compat" className="link-secondary">
        결과 코드로 궁합 보기 →
      </Link>
    </div>
  )
}
