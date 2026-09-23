import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { hasNickname } from './lib/identity'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Test from './pages/Test'
import AiTest from './pages/AiTest'
import MeTest from './pages/MeTest'
import MeResult from './pages/MeResult'
import MePair from './pages/MePair'
import NowTest from './pages/NowTest'
import NowResult from './pages/NowResult'
import AfterTest from './pages/AfterTest'
import AfterResult from './pages/AfterResult'
import Result from './pages/Result'
import Compat from './pages/Compat'
import People from './pages/People'
import PersonObservedTest from './pages/PersonObservedTest'
import InviteTest from './pages/InviteTest'
import Match from './pages/Match'
import Crush from './pages/Crush'
import CrushResult from './pages/CrushResult'
import ReportFolder from './pages/ReportFolder'
import Admin from './pages/Admin'

/* GitHub Pages 하위 경로 배포라 HashRouter 를 쓴다.
   404.html 우회 없이 새로고침·직접 진입이 전부 정상 동작한다.
   계정 로그인은 없고, 첫 방문에 닉네임만 받아 브라우저에 익명 owner_id를
   저장한다(src/lib/identity.js) — 그래서 온보딩 게이트만 통과하면 나머지는
   여전히 로그인 없는 공개 사이트다. */
export default function App() {
  const [ready, setReady] = useState(hasNickname())

  if (!ready) {
    return <Onboarding onDone={() => setReady(true)} />
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/people" element={<People />} />
        <Route path="/people/:personId/observed" element={<PersonObservedTest />} />
        <Route path="/invite/:token" element={<InviteTest />} />
        <Route path="/match" element={<Match />} />
        <Route path="/crush" element={<Crush />} />
        <Route path="/crush/result" element={<CrushResult />} />
        <Route path="/folder" element={<ReportFolder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/test/:slug" element={<Test />} />
        <Route path="/ai-test/:slug" element={<AiTest />} />
        <Route path="/me/start" element={<MeTest />} />
        <Route path="/me/result/:assessmentId" element={<MeResult />} />
        <Route path="/me/pair" element={<MePair />} />
        <Route path="/now/start" element={<NowTest />} />
        <Route path="/now/result/:assessmentId" element={<NowResult />} />
        <Route path="/after/start" element={<AfterTest />} />
        <Route path="/after/result/:assessmentId" element={<AfterResult />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/compat" element={<Compat />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}
