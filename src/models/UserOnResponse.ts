import { ResponseOnQuestion, SurveyFeedback, User } from '@prisma/client';

export interface UserOnResponse {
  id: number;
  formId: number;
  userId: number | null;
  guest: any;
  sentAt: Date;
  responseOnQuestions: ResponseOnQuestion[];
  form: SurveyFeedback;
  user: User | null;
}
