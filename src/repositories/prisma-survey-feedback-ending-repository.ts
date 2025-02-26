import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class PrismaSurveyEndingRepository {
  constructor(private prisma: PrismaService) {}

  async createSurveyEnding(
    data: {
      formId: number;
      message: string;
      redirectUrl?: string;
      mediaId?: number;
    },
    tx?: any,
  ) {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackEnding.create({ data });
  }

  async getSurveyEndingBySurveyId(formId: number, tx?: any) {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackEnding.findUnique({
      where: { formId: formId },
      include: { media: true },
    });
  }

  async updateSurveyEnding(
    formId: number,
    data: {
      message: string;
      redirectUrl?: string;
      mediaId?: number;
    },
    tx?: any,
  ) {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackEnding.update({
      where: { formId },
      data,
    });
  }

  async deleteSurveyEnding(formId: number, tx?: any) {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackEnding.delete({ where: { formId } });
  }

  async getAllSurveyEnding(formId: number, tx?: any) {
    const prisma = tx || this.prisma;
    return prisma.surveyFeedbackEnding.findMany({
      where: { formId: formId },
    });
  }
}
