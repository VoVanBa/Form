import { SurveyFeedback } from 'src/surveyfeedback-form/entities/SurveyFeedback';
import { User } from 'src/users/entities/User';

export class Business {
  id: number;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user: User;
  forms: SurveyFeedback[];

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.name = data.name ?? '';
    this.address = data.address ?? '';
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.userId = data.userId ?? 0;
    this.user = data.user ? new User(data.user) : undefined;
    this.forms = Array.isArray(data.forms)
      ? data.forms.map((form) => new SurveyFeedback(form))
      : [];
  }
}
