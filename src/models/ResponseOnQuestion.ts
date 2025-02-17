import { AnswerOption } from './AnswerOption';
import { Question } from './Question';
import { SurveyFeedback } from './SurveyFeedback';
import { UserOnResponse } from './UserOnResponse';

export class ResponseOnQuestion {
  id: number;

  useronResponseId: number;

  questionId: number;

  formId: number;

  answerOptionId: number | null;

  answerText: string | null;

  ratingValue: number | null;

  answerOption: AnswerOption | null;

  question: Question;

  userResponse?: UserOnResponse;

  form: SurveyFeedback;

  constructor(data: Partial<ResponseOnQuestion>) {
    Object.assign(this, data);
  }

  static fromPrisma(data: any): ResponseOnQuestion {
    if (!data) return null;
    return new ResponseOnQuestion({
      id: data.id,
      useronResponseId: data.useronResponseId,
      questionId: data.questionId,
      formId: data.formId,
      answerOptionId: data.answerOptionId,
      answerText: data.answerText || null,
      ratingValue: data.ratingValue || null,
      answerOption: data.answerOption
        ? AnswerOption.fromPrisma(data.answerOption)
        : null,
      question: data.question ? Question.fromPrisma(data.question) : null,
      userResponse: data.userResponse
        ? UserOnResponse.fromPrisma(data.userResponse)
        : null,
      form: data.form ? SurveyFeedback.fromPrisma(data.form) : null,
    });
  }
}
