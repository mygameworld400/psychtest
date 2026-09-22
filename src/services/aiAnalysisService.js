import { supabase } from '../lib/supabase'

// OpenAI 크레딧 충전 전까지는 실제 호출 없이 목업 분석을 돌려준다.
// 충전 후에는 이 값만 false로 바꾸면 된다.
const USE_MOCK = true

const MOCK_ANALYSIS = `ㅋㅋㅋ 이 답변은 너 성향이 꽤 선명하게 나와.

너는 과거를 바꿀 기회가 와도 무작정 안전한 선택만 하지는 않는 편이야. 적어놓은 이유를 보면 "리스크가 있어도 감수하겠다"는 쪽에 더 가깝고, 그 대신 뭘 바꿀지는 미리 정해두는 타입이라 즉흥적이라기보다는 계산된 과감함에 가까워.

핵심 애착 대상 하나는 확실히 정해두고, 그 외의 영역에서는 큰 보상을 위해 기꺼이 움직이는 경향이 보여. 손실을 아예 피하려 하기보다는 "이 정도는 감수할 수 있다"는 선을 스스로 긋는 편.

한 줄로 하면 —
**핵심은 강하게 지키면서, 그 외에는 과감하게 움직이는 편.**`

export async function requestAnalysis({ testTitle, items }) {
  if (USE_MOCK || !supabase) {
    await new Promise((r) => setTimeout(r, 900))
    return MOCK_ANALYSIS
  }

  const { data, error } = await supabase.functions.invoke('analyze', {
    body: { testTitle, items },
  })
  if (error) throw error
  return data.analysis
}
