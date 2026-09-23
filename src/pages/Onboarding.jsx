import { useState } from 'react'
import { setNickname } from '../lib/identity'

export default function Onboarding({ onDone }) {
  const [name, setName] = useState('')

  function submit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setNickname(trimmed)
    onDone()
  }

  return (
    <div className="page page-onboarding">
      <div className="onboarding-hero">
        <span className="eyebrow">REPORT STUDIO</span>
        <h1>어떻게 불러드릴까요?</h1>
        <p>계정을 만들지 않아도 돼요. 닉네임만 정하면 이 브라우저에서 바로 시작할 수 있어요.</p>
      </div>
      <form onSubmit={submit} className="onboarding-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="닉네임"
          maxLength={20}
          autoFocus
        />
        <button className="btn-primary" type="submit" disabled={!name.trim()}>
          시작하기
        </button>
      </form>
      <p className="onboarding-note">나중에 이메일 로그인으로 바꿔도 지금 만든 리포트는 그대로 이어져요.</p>
    </div>
  )
}
