import LikertTest from '../components/LikertTest'
import afterQuestionBank from '../data/questions/after.v1.json'
import { submitAssessment } from '../services/assessmentService'

export default function AfterTest() {
  const onSubmit = (responses) => submitAssessment('AFTER', afterQuestionBank, responses)
  return <LikertTest questionBank={afterQuestionBank} onSubmit={onSubmit} resultPathPrefix="/after/result" />
}
