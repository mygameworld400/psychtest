import { supabase } from '../lib/supabase'
import { getOwnerId } from '../lib/identity'

// 실제 PG(결제) 연동 전까지의 상품 카탈로그와 구매 흐름.
// [결제하기]를 누르면 pt_purchases에 status:'paid'로 바로 기록한다 — 결제 자체는
// 목업이고, 실제 PG를 붙일 때 이 파일의 purchase() 안쪽만 바꾸면 된다.
export const PRODUCTS = {
  ME_FULL: { sku: 'ME_FULL', name: 'ME 전체 리포트', desc: '나의 연애 성향 전체 지표 공개', list: 4900, sale: 1900 },
  PERSON_SLOT: { sku: 'PERSON_SLOT', name: '사람 추가 (최대 3명)', desc: '썸·연인·전 연인 프로필 등록', list: 4900, sale: 1900 },
  MATCH_FULL: { sku: 'MATCH_FULL', name: 'MATCH 전체 리포트', desc: '나에게 맞는 상대 10개 섹션 전체 공개', list: 4900, sale: 1900 },
  CRUSH: { sku: 'CRUSH', name: 'CRUSH 비교', desc: '썸 상대들과 각각 어떤 연애가 될지 비교', list: 9900, sale: 5900 },
  PAIR: { sku: 'PAIR', name: 'PAIR 궁합 분석', desc: '연인과의 실제 궁합 심층 분석', list: 9900, sale: 5900 },
  NOW: { sku: 'NOW', name: 'NOW 정밀 리포트', desc: '현재 관계 상태 정밀 분석', list: 14900, sale: 9900 },
  AFTER: { sku: 'AFTER', name: 'AFTER 심층분석', desc: '이별·재결합 심층 분석', list: 49000, sale: 35900 },
}

export async function purchase(sku) {
  const product = PRODUCTS[sku]
  if (!product) throw new Error('알 수 없는 상품이에요.')
  if (!supabase) return { sku, status: 'paid' }

  const { error } = await supabase.from('pt_purchases').insert({
    user_id: getOwnerId(),
    product_sku: sku,
    amount: product.sale,
    status: 'paid',
  })
  if (error) throw error
  return { sku, status: 'paid' }
}

export async function listPurchases() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('pt_purchases')
    .select('product_sku, amount, status, created_at')
    .eq('user_id', getOwnerId())
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function listEntitlements() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('pt_purchases')
    .select('product_sku')
    .eq('user_id', getOwnerId())
    .eq('status', 'paid')
  if (error) throw error
  return [...new Set((data ?? []).map((r) => r.product_sku))]
}

export async function isUnlocked(sku) {
  const owned = await listEntitlements()
  return owned.includes(sku)
}
