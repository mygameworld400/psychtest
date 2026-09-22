// AI 분석형 테스트 — 객관식 선택 + 자유서술 이유를 함께 받아 OpenAI로 분석한다.
// testEngine.js(축/극 점수 계산)와는 다른 엔진(AiTest.jsx + analyze 함수)을 쓴다.
export const rewindTest = {
  slug: "rewind",
  type: "ai",
  title: "인생 되감기 24시간권",
  intro:
    "어느 날 너한테 인생에서 딱 한 번만 쓸 수 있는 '24시간 되감기권'이 생겼어.\n과거의 어느 하루로 돌아가 24시간 동안 원하는 행동을 할 수 있어.\n그날이 끝나면 현재로 돌아오고, 바뀐 결과는 그대로 적용돼.",
  warning:
    "단, 네가 바꾼 뒤의 현재에서는 지금 네가 가장 소중하게 생각하는 것 하나가 사라질 수도 있어.",
  items: [
    {
      question: "무엇을 바꾸고 싶어?",
      choices: [
        { key: "A", text: "돈 — 주식, 코인, 복권번호 같은 미래 정보로 큰돈을 번다" },
        { key: "B", text: "관계 — 한 사람과의 관계를 바꾼다" },
        { key: "C", text: "실수 — 가장 크게 후회되는 선택 하나를 없앤다" },
        { key: "D", text: "기회 — 예전에 놓쳤던 기회 하나를 다시 잡는다" },
        { key: "E", text: "아무것도 안 바꿈 — 과거로 돌아가지만 그대로 둔다" },
      ],
      reasonPrompt: "왜 그걸 골랐어? 자유롭게 적어줘.",
    },
  ],
}

export const aiTests = { rewind: rewindTest }
