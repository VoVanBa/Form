export interface IResponseQuestionRepository {
  totalResponses(formId: number);
  create(
    questionId: number,
    answerOptionId: number,
    userResponseId: number,
    answerText: string,
    ratingValue: number,
    formId: number,
  );
  getGroupedResponsesByOption(formId: number);
  findDetailedResponses(formId: number);
  getAll(formId: number);
}
