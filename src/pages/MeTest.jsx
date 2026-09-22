import LikertTest from '../components/LikertTest'
import meQuestionBank from '../data/questions/me.v1.json'
import { submitMeAssessment } from '../services/assessmentService'

export default function MeTest() {
  return <LikertTest questionBank={meQuestionBank} onSubmit={submitMeAssessment} resultPathPrefix="/me/result" />
}
