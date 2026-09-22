// 실제 문항이 정해지면 이 파일을 교체하면 된다.
// 엔진(testEngine.js)은 이 구조만 지키면 어떤 테스트든 그대로 처리한다.
export const sampleTest = {
  slug: 'sample',
  title: '샘플 성향 테스트',
  axes: [
    { key: 'EI', left: 'E', right: 'I' },
    { key: 'TF', left: 'T', right: 'F' },
  ],
  questions: [
    {
      id: 1,
      text: '주말에 약속이 없다면?',
      options: [
        { text: '친구를 불러내서 논다', axis: 'EI', pole: 'left' },
        { text: '집에서 혼자 쉰다', axis: 'EI', pole: 'right' },
      ],
    },
    {
      id: 2,
      text: '친구가 고민을 털어놓으면?',
      options: [
        { text: '해결책부터 같이 찾는다', axis: 'TF', pole: 'left' },
        { text: '일단 공감하고 들어준다', axis: 'TF', pole: 'right' },
      ],
    },
    {
      id: 3,
      text: '새로운 모임에 가면?',
      options: [
        { text: '먼저 말 걸고 친해진다', axis: 'EI', pole: 'left' },
        { text: '분위기부터 살핀다', axis: 'EI', pole: 'right' },
      ],
    },
    {
      id: 4,
      text: '갈등이 생기면?',
      options: [
        { text: '논리적으로 시시비비를 가린다', axis: 'TF', pole: 'left' },
        { text: '감정이 상하지 않게 조율한다', axis: 'TF', pole: 'right' },
      ],
    },
  ],
  resultTypes: {
    ET: { title: '리더형', desc: '활동적이고 결단력이 있어요.' },
    EF: { title: '분위기메이커형', desc: '사람들과 어울리며 공감을 잘해요.' },
    IT: { title: '전략가형', desc: '차분하게 상황을 분석해요.' },
    IF: { title: '힐러형', desc: '조용히 곁을 지켜주는 편이에요.' },
  },
}

export const tests = { sample: sampleTest }
