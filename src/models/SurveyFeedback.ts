import { Business } from './Business';
import { BusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import {
  BusinessSurveyFeedbackSettings,
  FormStatus,
  Question,
  ResponseOnQuestion,
  SurveyFeedbackType,
  UserOnResponse,
} from '@prisma/client';

export class SurveyFeedback {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  type: SurveyFeedbackType;
  allowAnonymous: boolean;
  status: FormStatus;
  businessId: number;
  businessSettings: BusinessSurveyFeedbackSettings[];
  business: Business;
  questions: Question[];
  userFormResponses: UserOnResponse[];
  configurations: BusinessQuestionConfiguration[];
  responses: ResponseOnQuestion[];

  constructor(
    id: number,
    name: string,
    description: string | undefined,
    createdBy: string,
    createdAt: Date,
    updatedAt: Date,
    type: SurveyFeedbackType,
    allowAnonymous: boolean,
    status: FormStatus,
    businessId: number,
    businessSettings: BusinessSurveyFeedbackSettings[],
    business: Business,
    questions: Question[],
    userFormResponses: UserOnResponse[],
    configurations: BusinessQuestionConfiguration[],
    responses: ResponseOnQuestion[],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.type = type;
    this.allowAnonymous = allowAnonymous;
    this.status = status;
    this.businessId = businessId;
    this.businessSettings = businessSettings;
    this.business = business;
    this.questions = questions;
    this.userFormResponses = userFormResponses;
    this.configurations = configurations;
    this.responses = responses;
  }
}
