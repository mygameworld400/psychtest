import { supabase } from '../lib/supabase'
import meQuestionBank from '../data/questions/me.v1.json'
import observedQuestionBank from '../data/questions/me.observed.v1.json'
import { computeDimensionScores, selectPriorityDimensions } from './scoringEngine'
import { getOwnerId } from '../lib/identity'
import { rememberResult } from '../lib/lastResult'

function genId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}

/** ME/NOW/AFTER 공용 제출 함수. responses: [{ questionId, value? , freeText? }] —
 * value는 likert 1~5, freeText는 자유서술 문항용. 점수 계산은 scoringEngine이 전담한다.
 * personId를 넘기면(사람 추가 흐름) 그 사람 명의 결과로 저장된다. */
export async function submitAssessment(productType, questionBank, responses, { personId } = {}) {
  const id = genId()
  const likertResponses = responses
    .filter((r) => r.value !== undefined && r.value !== null)
    .map((r) => ({ questionId: r.questionId, value: r.value }))

  const dimensionScores = computeDimensionScores(questionBank, likertResponses)
  const priority = selectPriorityDimensions(dimensionScores, { limit: 10 })

  if (!personId) rememberResult({ id, productType })

  if (!supabase) return { id, dimensionScores, priority }

  await supabase.from('pt_assessments').insert({
    id,
    product_type: productType,
    person_id: personId ?? null,
    owner_id: getOwnerId(),
    status: 'completed',
    question_version: questionBank.version,
    scoring_version: 'v1',
    completed_at: new Date().toISOString(),
  })

  const responseRows = responses.map((r) => ({
    assessment_id: id,
    question_id: r.questionId,
    numeric_value: r.value ?? null,
    free_text: r.freeText ?? null,
  }))
  if (responseRows.length) {
    const { error } = await supabase.from('pt_responses').insert(responseRows)
    if (error) throw error
  }

  const scoreRows = Object.values(dimensionScores)
    .filter((d) => d.normalizedScore !== null)
    .map((d) => ({
      assessment_id: id,
      dimension_key: d.dimension,
      normalized_score: d.normalizedScore,
      confidence: d.confidence,
    }))
  if (scoreRows.length) {
    const { error } = await supabase.from('pt_computed_scores').insert(scoreRows)
    if (error) throw error
  }

  return { id, dimensionScores, priority }
}

export function submitMeAssessment(responses, opts) {
  return submitAssessment('ME', meQuestionBank, responses, opts)
}

export function submitObservedAssessment(responses, personId) {
  return submitAssessment('ME', observedQuestionBank, responses, { personId })
}

export async function getAssessmentResult(id) {
  if (!supabase) return null
  const { data: assessment, error: aErr } = await supabase
    .from('pt_assessments')
    .select('id, product_type, question_version, completed_at')
    .eq('id', id)
    .maybeSingle()
  if (aErr) throw aErr
  if (!assessment) return null

  const { data: scores, error: sErr } = await supabase
    .from('pt_computed_scores')
    .select('dimension_key, normalized_score, confidence')
    .eq('assessment_id', id)
  if (sErr) throw sErr

  return { assessment, scores: scores ?? [] }
}

export const getMeResult = getAssessmentResult
