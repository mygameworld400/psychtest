/** 답변 목록으로 결과 타입 코드를 계산한다. 축(axis)마다 우세한 극(pole)의
 * 글자를 이어 붙인다 (예: EI 축에서 left 우세 + TF 축에서 right 우세 -> "EF"). */
export function scoreAnswers(test, answers) {
  const tally = {}
  for (const axis of test.axes) tally[axis.key] = { left: 0, right: 0 }

  for (const answer of answers) {
    const question = test.questions.find((q) => q.id === answer.questionId)
    const option = question?.options[answer.optionIndex]
    if (!option) continue
    tally[option.axis][option.pole] += 1
  }

  return test.axes
    .map((axis) => {
      const t = tally[axis.key]
      return t.left >= t.right ? axis.left : axis.right
    })
    .join('')
}

export function resultInfo(test, typeCode) {
  return test.resultTypes[typeCode] ?? { title: typeCode, desc: '' }
}
