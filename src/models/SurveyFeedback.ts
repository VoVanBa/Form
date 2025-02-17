import { name } from 'ejs';
import { Business } from './Business';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import { BusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { FormStatus } from './enums/FormStatus';
import { SurveyFeedbackType } from './enums/SurveyFeedbackType';
import { Question } from './Question';
import { ResponseOnQuestion } from './ResponseOnQuestion';
import { UserOnResponse } from './UserOnResponse';
export class SurveyFeedback {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  type: SurveyFeedbackType;
  allowAnonymous: boolean;
  status: FormStatus;
  businessId: number;
  businessSettings?: BusinessSurveyFeedbackSettings[];
  business?: Business;
  questions?: Question[];
  userFormResponses?: UserOnResponse[];
  configurations?: BusinessQuestionConfiguration[];
  responses?: ResponseOnQuestion[];

  constructor(data: Partial<SurveyFeedback>) {
    Object.assign(this, data);
  }

  static fromPrisma(data: any): SurveyFeedback {
    if (!data) return null;
    return new SurveyFeedback({
      id: data.id,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      type: data.type,
      allowAnonymous: data.allowAnonymous,
      status: data.status,
      businessId: data.businessId,
      businessSettings: data.businessSettings
        ? data.businessSettings.map(BusinessSurveyFeedbackSettings.fromPrisma)
        : [],
      business: data.business ? Business.fromPrisma(data.business) : null,
      questions: data.questions ? data.questions.map(Question.fromPrisma) : [],
      userFormResponses: data.userFormResponses
        ? data.userFormResponses.map(UserOnResponse.fromPrisma)
        : [],
      configurations: data.configurations
        ? data.configurations.map(BusinessQuestionConfiguration.fromPrisma)
        : [],
      responses: data.responses
        ? data.responses.map(ResponseOnQuestion.fromPrisma)
        : [],
    });
  }
}
