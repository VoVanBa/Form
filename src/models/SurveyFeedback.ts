import { IBusiness } from './Business';
import { IBusinessQuestionConfiguration } from './BusinessQuestionConfiguration';
import { IBusinessSurveyFeedbackSettings } from './BusinessSurveyFeedbackSettings';
import { FormStatus } from './enums/FormStatus';
import { SurveyFeedbackType } from './enums/SurveyFeedbackType';
import { IQuestion } from './Question';
import { IResponseOnQuestion } from './ResponseOnQuestion';
import { IUserOnResponse } from './UserOnResponse';

export interface ISurveyFeedback {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isOpen: boolean;
  type: SurveyFeedbackType;
  allowAnonymous: boolean;
  status: FormStatus;
  businessId: number;
  businessSettings: IBusinessSurveyFeedbackSettings[];
  business: IBusiness;
  questions: IQuestion[];
  userFormResponses: IUserOnResponse[];
  configurations: IBusinessQuestionConfiguration[];
  responses: IResponseOnQuestion[];
}
