import {
  AnswerOption,
  Question,
  SurveyFeedback,
  UserOnResponse,
} from '@prisma/client';
import { Expose } from 'class-transformer';

export class ResponseOnQuestion {
  @Expose()
  id: number;
  @Expose()
  useronResponseId: number;
  @Expose()
  questionId: number;
  @Expose()
  formId: number;
  @Expose()
  answerOptionId: number | null;
  @Expose()
  answerText: string | null;
  @Expose()
  ratingValue: number | null;
  @Expose()
  answerOption: AnswerOption | null;
  @Expose()
  question: Question;
  @Expose()
  userResponse: UserOnResponse;
  @Expose()
  form: SurveyFeedback;

  constructor(
    id: number,
    useronResponseId: number,
    questionId: number,
    formId: number,
    answerOptionId: number | null,
    answerText: string | null,
    ratingValue: number | null,
    answerOption: AnswerOption | null,
    question: Question,
    userResponse: UserOnResponse,
    form: SurveyFeedback,
  ) {
    this.id = id;
    this.useronResponseId = useronResponseId;
    this.questionId = questionId;
    this.formId = formId;
    this.answerOptionId = answerOptionId;
    this.answerText = answerText;
    this.ratingValue = ratingValue;
    this.answerOption = answerOption;
    this.question = question;
    this.userResponse = userResponse;
    this.form = form;
  }
}
