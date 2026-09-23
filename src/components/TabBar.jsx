import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/', icon: '🏠', label: '홈' },
  { path: '/people', icon: '👥', label: '사람' },
  { path: '/folder', icon: '📁', label: '리포트함' },
]

export default function TabBar() {
  const { pathname } = useLocation()
  return (
    <div className="tabbar">
      <div className="tabbar-inner">
        {TABS.map((t) => (
          <Link key={t.path} to={t.path} className={'tab' + (pathname === t.path ? ' on' : '')}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
