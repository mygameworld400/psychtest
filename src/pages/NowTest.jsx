import LikertTest from '../components/LikertTest'
import nowQuestionBank from '../data/questions/now.v1.json'
import { submitAssessment } from '../services/assessmentService'

export default function NowTest() {
  const onSubmit = (responses) => submitAssessment('NOW', nowQuestionBank, responses)
  return <LikertTest questionBank={nowQuestionBank} onSubmit={onSubmit} resultPathPrefix="/now/result" />
}
