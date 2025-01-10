import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreatesurveyFeedbackDto } from 'src/forms/dtos/create.form.dto';
import { IsurveyFeedbackRepository } from './i-repositories/form.repository';
import { UpdatesurveyFeedbackDto } from 'src/forms/dtos/update.form.dto';

@Injectable()
export class PrismasurveyFeedbackRepository
  implements IsurveyFeedbackRepository
{
  constructor(private readonly prisma: PrismaService) {}
  async createsurveyFeedback(data: CreatesurveyFeedbackDto) {
    return this.prisma.surveyFeedback.create({
      data,
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
}
