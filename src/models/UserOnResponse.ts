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

  constructor(data: Partial<UserOnResponse>) {
    Object.assign(this, data);
  }
}
