import { CreatesurveyFeedbackDto } from 'src/forms/dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from 'src/forms/dtos/update.form.dto';

export interface IsurveyFeedbackRepository {
  createsurveyFeedback(data: CreatesurveyFeedbackDto);
  getsurveyFeedbackById(id: number);
  getAllsurveyFeedbacks(id: number);
  updatesurveyFeedback(id: number, data: UpdatesurveyFeedbackDto);
  deletesurveyFeedback(id: number);
}
