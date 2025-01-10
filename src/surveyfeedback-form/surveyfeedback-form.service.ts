import { Injectable } from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-form.repository';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';

@Injectable()
export class SurveyFeedackFormService {
  constructor(private formRepository: PrismasurveyFeedbackRepository) {}
  async createForm(createFormDto: CreatesurveyFeedbackDto, businessId: number) {
    return this.formRepository.createsurveyFeedback(createFormDto, businessId);
  }
  async getForms(businessId: number) {
    return this.formRepository.getAllsurveyFeedbacks(businessId);
  }
  async getFormById(id: number) {
    return this.formRepository.getsurveyFeedbackById(id);
  }
  async updateForm(id: number, updateFormDto: UpdatesurveyFeedbackDto) {
    return this.formRepository.updatesurveyFeedback(id, updateFormDto);
  }
  async deleteForm(id: number) {
    return this.formRepository.deletesurveyFeedback(id);
  }
}
