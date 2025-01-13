import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/create.form.dto';
import { IsurveyFeedbackRepository } from './i-repositories/form.repository';
import { UpdatesurveyFeedbackDto } from 'src/surveyfeedback-form/dtos/update.form.dto';
import { FormStatus, SurveyFeedback } from '@prisma/client';

@Injectable()
export class PrismasurveyFeedbackRepository
  implements IsurveyFeedbackRepository
{
  constructor(private readonly prisma: PrismaService) {}
  async createsurveyFeedback(
    data: CreatesurveyFeedbackDto,
    businessId: number,
  ) {
    return this.prisma.surveyFeedback.create({
      data: {
        ...data,
        businessId: businessId,
      },
    });
  }
  async getsurveyFeedbackById(id: number) {
    return this.prisma.surveyFeedback.findUnique({
      where: { id },
    });
  }
  async getAllsurveyFeedbacks(businessId: number) {
    return this.prisma.surveyFeedback.findMany({
      where: {
        businessId,
      },
    });
  }
  async updatesurveyFeedback(id: number, data: UpdatesurveyFeedbackDto) {
    return this.prisma.surveyFeedback.update({
      where: { id },
      data,
    });
  }
  async deletesurveyFeedback(id: number) {
    return this.prisma.surveyFeedback.delete({
      where: { id },
    });
  }
  async updateStatus(status: FormStatus, formId: number) {
    return this.prisma.surveyFeedback.update({
      where: {
        id: formId,
      },
      data: {
        status: status,
      },
    });
  }

  async updateSurveyallowAnonymous(surveyId: number, active: boolean) {
    return await this.prisma.surveyFeedback.update({
      where: {
        id: surveyId,
      },
      data: {
        allowAnonymous: active,
      },
    });
  }
}
