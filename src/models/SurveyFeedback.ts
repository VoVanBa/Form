import {
  Business,
  BusinessQuestionConfiguration,
  BusinessSurveyFeedbackSettings,
  FormStatus,
  Question,
  ResponseOnQuestion,
  SurveyFeedbackType,
  UserOnResponse,
} from '@prisma/client';
import { Expose } from 'class-transformer';

export class SurveyFeedback {
  @Expose()
  readonly id: number;
  @Expose()
  readonly name: string;
  @Expose()
  readonly description?: string;
  @Expose()
  readonly createdBy: string;
  @Expose()
  readonly createdAt: Date;
  @Expose()
  readonly updatedAt: Date;
  @Expose()
  readonly type: SurveyFeedbackType;
  @Expose()
  readonly allowAnonymous: boolean;
  @Expose()
  readonly status: FormStatus;
  @Expose()
  readonly businessId: number;
  @Expose()
  readonly businessSettings: BusinessSurveyFeedbackSettings[];
  @Expose()
  readonly business: Business;
  @Expose()
  readonly questions: Question[];
  @Expose()
  readonly userFormResponses: UserOnResponse[];
  @Expose()
  readonly configurations: BusinessQuestionConfiguration[];
  @Expose()
  readonly responses: ResponseOnQuestion[];

  constructor(data: {
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
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.type = data.type;
    this.allowAnonymous = data.allowAnonymous;
    this.status = data.status;
    this.businessId = data.businessId;
    this.businessSettings = [...data.businessSettings]; // Deep copy array to avoid mutation
    this.business = { ...data.business }; // Deep copy object to avoid mutation
    this.questions = [...data.questions];
    this.userFormResponses = [...data.userFormResponses];
    this.configurations = [...data.configurations];
    this.responses = [...data.responses];
  }
}
