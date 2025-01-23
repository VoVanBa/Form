import { ResponseOnQuestion, SurveyFeedback, User } from '@prisma/client';

export class UserOnResponse {
  id: number;
  formId: number;
  userId: number | null;
  guest: any;
  sentAt: Date;
  responseOnQuestions: ResponseOnQuestion[];
  form: SurveyFeedback;
  user: User | null;

  constructor(
    id: number,
    formId: number,
    userId: number | null,
    guest: any,
    sentAt: Date,
    responseOnQuestions: ResponseOnQuestion[],
    form: SurveyFeedback,
    user: User | null,
  ) {
    this.id = id;
    this.formId = formId;
    this.userId = userId;
    this.guest = guest;
    this.sentAt = sentAt;
    this.responseOnQuestions = responseOnQuestions;
    this.form = form;
    this.user = user;
  }
}
