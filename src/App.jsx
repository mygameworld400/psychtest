import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'
import AiTest from './pages/AiTest'
import MeTest from './pages/MeTest'
import MeResult from './pages/MeResult'
import MePair from './pages/MePair'
import Result from './pages/Result'
import Compat from './pages/Compat'

/* GitHub Pages 하위 경로 배포라 HashRouter 를 쓴다.
   404.html 우회 없이 새로고침·직접 진입이 전부 정상 동작한다.
   로그인 없는 공개 사이트라 Gate 없이 바로 라우트를 그린다. */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test/:slug" element={<Test />} />
        <Route path="/ai-test/:slug" element={<AiTest />} />
        <Route path="/me/start" element={<MeTest />} />
        <Route path="/me/result/:assessmentId" element={<MeResult />} />
        <Route path="/me/pair" element={<MePair />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/compat" element={<Compat />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}
