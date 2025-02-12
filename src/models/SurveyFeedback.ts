import { Business } from './Business';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import { BusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { FormStatus } from './enums/FormStatus';
import { SurveyFeedbackType } from './enums/SurveyFeedbackType';
import { Question } from './Question';
import { ResponseOnQuestion } from './ResponseOnQuestion';
import { UserOnResponse } from './UserOnResponse';

export class SurveyFeedback {
  readonly id: number;

  readonly name: string;

  readonly description?: string;

  readonly createdBy: string;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  readonly type: SurveyFeedbackType;

  readonly allowAnonymous: boolean;

  readonly status: FormStatus;

  readonly businessId: number;

  readonly businessSettings: BusinessSurveyFeedbackSettings[];

  readonly business: Business;

  readonly questions: Question[];

  readonly userFormResponses: UserOnResponse[];

  readonly configurations: BusinessQuestionConfiguration[];

  readonly responses: ResponseOnQuestion[];

  constructor(data: Partial<SurveyFeedback>) {
    Object.assign(this, data);
  }
}
