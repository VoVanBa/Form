import { FormStatus } from '@prisma/client';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';

export interface IsurveyFeedbackRepository {
  createsurveyFeedback(data: CreatesurveyFeedbackDto, businessId: number);
  getsurveyFeedbackById(id: number);
  getAllsurveyFeedbacks(id: number);
  updatesurveyFeedback(id: number, data: UpdatesurveyFeedbackDto);
  deletesurveyFeedback(id: number);
  updateStatus(status: FormStatus,formId:number);
}
