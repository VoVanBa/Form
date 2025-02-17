import { ResponseOnQuestion } from "./ResponseOnQuestion";
import { SurveyFeedback } from "./SurveyFeedback";
import { User } from "./User";

export class UserOnResponse {
  id: number;
  formId: number;
  userId: number | null;
  guest: any;
  sentAt: Date;
  responseOnQuestions: ResponseOnQuestion[];
  form: SurveyFeedback;
  user: User | null;

  constructor(data: Partial<UserOnResponse>) {
    Object.assign(this, data);
  }

  static fromPrisma(data: any): UserOnResponse {
    if (!data) return null;
    return new UserOnResponse({
      id: data.id,
      formId: data.formId,
      userId: data.userId,
      guest: data.guest,
      sentAt: data.sentAt,
      responseOnQuestions: data.responseOnQuestions
        ? data.responseOnQuestions.map(ResponseOnQuestion.fromPrisma)
        : [],
      form: data.form ? SurveyFeedback.fromPrisma(data.form) : null,
      user: data.user ? User.fromPrisma(data.user) : null,
    });
  }
}
