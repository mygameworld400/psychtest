import { supabase } from '../lib/supabase'

function genId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}

/** 결과를 저장하고 공유용 id를 돌려준다. 서버가 없으면(로컬 개발) id만 만들어
 * 돌려주고 저장은 건너뛴다 — 이 경우 결과 페이지 새로고침 시 사라진다. */
export async function saveResult({ testSlug, resultType, answers }) {
  const id = genId()
  if (!supabase) return id

  const { error } = await supabase
    .from('pt_results')
    .insert({ id, test_slug: testSlug, result_type: resultType, answers })
  if (error) throw error
  return id
}

/** AI 장문 분석 결과를 저장하고 공유용 id를 돌려준다. */
export async function saveAiResult({ testSlug, answers, analysis }) {
  const id = genId()
  if (!supabase) return id

  const { error } = await supabase
    .from('pt_results')
    .insert({ id, test_slug: testSlug, answers, ai_analysis: analysis })
  if (error) throw error
  return id
}

export async function getResult(id) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('pt_results')
    .select('id, test_slug, result_type, answers, ai_analysis, created_at')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}
