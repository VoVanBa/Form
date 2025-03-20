import { ResponseOnQuestion } from './ResponseOnQuestion';
import { SurveyFeedback } from '../surveyfeedback-form/entities/SurveyFeedback';
import { User } from 'src/users/entities/User';

export class UserOnResponse {
  id: number;
  formId: number;
  userId: number | null;
  guest: any;
  sentAt: Date;
  responseOnQuestions: ResponseOnQuestion[];
  form: SurveyFeedback;
  user: User | null;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.formId = data.formId ?? 0;
    this.userId = data.userId ?? null;
    this.guest = data.guest ?? {};
    this.sentAt = data.sentAt ?? new Date();
    this.responseOnQuestions = Array.isArray(data.responseOnQuestions)
      ? data.responseOnQuestions.map((r) => new ResponseOnQuestion(r))
      : [];
    this.form = data.form ? new SurveyFeedback(data.form) : undefined;
    this.user = data.user ? new User(data.user) : undefined;
  }
}
