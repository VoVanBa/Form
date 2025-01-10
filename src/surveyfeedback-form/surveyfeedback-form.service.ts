import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-form.repository';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';
import { PrismaBusinessRepository } from 'src/repositories/prims-business.repository';
import { FormStatus } from '@prisma/client';

@Injectable()
export class SurveyFeedackFormService {
  constructor(
    private formRepository: PrismasurveyFeedbackRepository,
    private businessRepository: PrismaBusinessRepository,
  ) {}
  async createForm(createFormDto: CreatesurveyFeedbackDto, businessId: number) {
    return this.formRepository.createsurveyFeedback(createFormDto, businessId);
  }
  async getForms(businessId: number) {
    return this.formRepository.getAllsurveyFeedbacks(businessId);
  }
  async getFormById(id: number, businessId: number) {
    const business = this.businessRepository.getbusinessbyId(businessId);
    if (!business) {
      throw new BadRequestException('not found business');
    }
    return this.formRepository.getsurveyFeedbackById(id);
  }
  async updateForm(id: number, updateFormDto: UpdatesurveyFeedbackDto) {
    return this.formRepository.updatesurveyFeedback(id, updateFormDto);
  }
  async deleteForm(id: number) {
    return this.formRepository.deletesurveyFeedback(id);
  }
  async updateStatus(status: FormStatus, formId: number, businessId: number) {
    const existingBusiness =
      this.businessRepository.getbusinessbyId(businessId);

    if (!existingBusiness) {
      throw new BadRequestException('bussiness not found');
    }

    const existingForm = this.getFormById(formId, businessId);
    if (!existingForm) {
      throw new BadRequestException('form not found');
    }

    this.formRepository.updateStatus(status, formId);
  }
}
