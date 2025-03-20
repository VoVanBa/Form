import { FormStatus } from 'src/surveyfeedback-form/entities/enums/FormStatus';
import { SurveyFeedback } from 'src/surveyfeedback-form/entities/SurveyFeedback';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';

export interface ISurveyFeedbackRepository {
  createSurveyFeedback(
    data: CreatesurveyFeedbackDto,
    businessId: number,
    tx?: any,
  ): Promise<SurveyFeedback>;
  getSurveyFeedbackById(id: number, tx?: any): Promise<SurveyFeedback>;
  getAllSurveyFeedbacks(
    businessId: number,
    tx?: any,
  ): Promise<SurveyFeedback[]>;
  updateSurveyFeedback(
    id: number,
    data: UpdatesurveyFeedbackDto,
    tx?: any,
  ): Promise<SurveyFeedback>;
  deleteSurveyFeedback(id: number, tx?: any): Promise<void>;
  updateStatus(
    status: FormStatus,
    formId: number,
    tx?: any,
  ): Promise<SurveyFeedback>;
  updateSurveyAllowAnonymous(
    surveyId: number,
    active: boolean,
    tx?: any,
  ): Promise<SurveyFeedback>;
}
