import { AnswerOption } from './AnswerOption';
import { Question } from './Question';
import { UserOnResponse } from './UserOnResponse';
import { SurveyFeedback } from './SurveyFeedback';

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
  userResponse: UserOnResponse;
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
