import { FormStatus } from './enums/FormStatus';
import { SurveyFeedbackType } from './enums/SurveyFeedbackType';
import { Question } from '../../question/entities/Question';
import { ResponseOnQuestion } from '../../models/ResponseOnQuestion';
import { UserOnResponse } from '../../models/UserOnResponse';
import { SurveyFeedbackEnding } from './SurveyFeedbackEnding';
import { Business } from 'src/business/entities/Business';
import { BusinessSurveyFeedbackSettings } from 'src/settings/entities/BusinessSurveyFeedbackSettings';
import { BusinessQuestionConfiguration } from 'src/settings/entities/BusinessQuestionConfiguration';

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
  ending?: SurveyFeedbackEnding;

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.name = data.name ?? '';
    this.description = data.description ?? '';
    this.createdBy = data.createdBy ?? '';
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.type = data.type ?? SurveyFeedbackType.SURVEY;
    this.allowAnonymous = data.allowAnonymous ?? false;
    this.status = data.status ?? FormStatus.DRAFT;
    this.businessId = data.businessId ?? 0;
    this.businessSettings = Array.isArray(data.businessSettings)
      ? data.businessSettings.map((b) => new BusinessSurveyFeedbackSettings(b))
      : [];
    this.business = data.business ? new Business(data.business) : undefined;
    this.questions = Array.isArray(data.questions)
      ? data.questions.map((q) => new Question(q))
      : [];
    this.userFormResponses = Array.isArray(data.userFormResponses)
      ? data.userFormResponses.map((u) => new UserOnResponse(u))
      : [];
    this.configurations = Array.isArray(data.configurations)
      ? data.configurations.map((c) => new BusinessQuestionConfiguration(c))
      : [];
    this.responses = Array.isArray(data.responses)
      ? data.responses.map((r) => new ResponseOnQuestion(r))
      : [];
    this.ending = data.ending
      ? new SurveyFeedbackEnding(data.ending)
      : undefined;
  }
}
