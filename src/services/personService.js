import { supabase } from '../lib/supabase'
import { getOwnerId } from '../lib/identity'

export const MAX_PERSONS = 3

function genToken() {
  return crypto.randomUUID().replace(/-/g, '')
}

export async function listPersons() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('pt_persons')
    .select('id, display_name, relationship_label, response_mode, created_at')
    .eq('owner_user_id', getOwnerId())
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

/** mode: 'direct' | 'observed'. direct면 초대 링크(token)를 같이 만들어 돌려준다. */
export async function createPerson({ displayName, relationshipLabel, mode }) {
  if (!supabase) throw new Error('서버 연결이 설정되지 않았어요.')
  const existing = await listPersons()
  if (existing.length >= MAX_PERSONS) throw new Error(`사람은 최대 ${MAX_PERSONS}명까지 추가할 수 있어요.`)

  const { data: person, error } = await supabase
    .from('pt_persons')
    .insert({
      owner_user_id: getOwnerId(),
      display_name: displayName.trim(),
      relationship_label: relationshipLabel,
      response_mode: mode,
    })
    .select('id, display_name, relationship_label, response_mode, created_at')
    .single()
  if (error) throw error

  if (mode !== 'direct') return { person, inviteToken: null }

  const token = genToken()
  const { error: inviteError } = await supabase.from('pt_invite_links').insert({
    owner_user_id: getOwnerId(),
    person_id: person.id,
    token,
  })
  if (inviteError) throw inviteError

  return { person, inviteToken: token }
}

export async function getPerson(personId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('pt_persons')
    .select('id, display_name, relationship_label, response_mode, created_at')
    .eq('id', personId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function deletePerson(personId) {
  if (!supabase) return
  const { error } = await supabase.from('pt_persons').delete().eq('id', personId).eq('owner_user_id', getOwnerId())
  if (error) throw error
}

export async function resolveInvite(token) {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('resolve_invite', { p_token: token })
  if (error) throw error
  return data?.[0] ?? null
}

export async function markInviteUsed(token) {
  if (!supabase) return
  await supabase.rpc('mark_invite_used', { p_token: token })
}

/** 사람이 direct 응답을 이미 완료했다면 그 사람의 최신 ME 결과 id를 돌려준다. */
export async function latestMeAssessmentForPerson(personId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('pt_assessments')
    .select('id, completed_at')
    .eq('person_id', personId)
    .eq('product_type', 'ME')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.id ?? null
}
