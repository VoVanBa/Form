import { AnswerOption } from 'src/answer-option/entities/AnswerOption';
import { Question } from '../question/entities/Question';
import { SurveyFeedback } from '../surveyfeedback-form/entities/SurveyFeedback';
import { UserOnResponse } from './UserOnResponse';

export class ResponseOnQuestion {
  id: number;
  useronResponseId: number;
  questionId: number;
  formId: number;
  answerOptionId: number | null;
  answerText: string | null;
  answeredAt: Date;
  ratingValue: number | null;
  answerOption: AnswerOption | null;
  question: Question;
  otherAnswer: string;
  userResponse?: UserOnResponse;
  form: SurveyFeedback;
  skipped: boolean;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.useronResponseId = data.useronResponseId ?? 0;
    this.questionId = data.questionId ?? 0;
    this.formId = data.formId ?? 0;
    this.answerOptionId = data.answerOptionId ?? null;
    this.answerText = data.answerText ?? null;
    this.answeredAt = data.answeredAt ?? new Date();
    this.ratingValue = data.ratingValue ?? null;
    this.skipped = data.skipped;
    this.otherAnswer = data.otherAnswer ?? '';
    this.answerOption = data.answerOption
      ? new AnswerOption(data.answerOption)
      : null;
    this.question = data.question ? new Question(data.question) : undefined;
    this.userResponse = data.userResponse
      ? new UserOnResponse(data.userResponse)
      : undefined;
    this.form = data.form ? new SurveyFeedback(data.form) : undefined;
  }
}
