import { Business } from './Business';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import { BusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { FormStatus } from './enums/FormStatus';
import { SurveyFeedbackType } from './enums/SurveyFeedbackType';
import { Question } from './Question';
import { ResponseOnQuestion } from './ResponseOnQuestion';
import { UserOnResponse } from './UserOnResponse';
export class SurveyFeedback {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public createdBy: string,
    public createdAt: Date,
    public updatedAt: Date,
    public type: SurveyFeedbackType,
    public allowAnonymous: boolean,
    public status: FormStatus,
    public businessId: number,
    public businessSettings?: BusinessSurveyFeedbackSettings[],
    public business?: Business,
    public questions?: Question[], // Quan hệ mới
    public userFormResponses?: UserOnResponse[],
    public configurations?: BusinessQuestionConfiguration[],
    public responses?: ResponseOnQuestion[],
  ) {}

  static fromPrisma(data: any): SurveyFeedback {
    if (!data) return null;
    return new SurveyFeedback(
      data.id,
      data.name,
      data.description,
      data.createdBy,
      data.createdAt,
      data.updatedAt,
      data.type,
      data.allowAnonymous,
      data.status,
      data.businessId,
      data.businessSettings || [],
      data.business || null,
      data.questions?.map(Question.fromPrisma) || [], // Ánh xạ questions
      data.userFormResponses || [],
      data.configurations || [],
      data.responses || [],
    );
  }
}
