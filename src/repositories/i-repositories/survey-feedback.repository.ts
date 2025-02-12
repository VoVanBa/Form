import { FormStatus } from 'src/models/enums/FormStatus';
import { SurveyFeedback } from 'src/models/SurveyFeedback';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';

export interface IsurveyFeedbackRepository {
  createsurveyFeedback(data: CreatesurveyFeedbackDto, businessId: number);
  getsurveyFeedbackById(id: number);
  getAllsurveyFeedbacks(id: number): Promise<SurveyFeedback[]>;
  updatesurveyFeedback(id: number, data: UpdatesurveyFeedbackDto);
  deletesurveyFeedback(id: number);
  updateStatus(status: FormStatus, formId: number);
  updateSurveyallowAnonymous(surveyId: number, active: boolean);
}
