import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';

// prisma-survey-ending.repository.ts
@Injectable()
export class PrismaSurveyEndingRepository {
  constructor(private prisma: PrismaService) {}

  async createSurveyEnding(data: {
    formId: number;
    message: string;
    redirectUrl?: string;
    mediaId?: number;
  }) {
    return this.prisma.surveyFeedbackEnding.create({ data });
  }

  async getSurveyEndingBySurveyId(formId: number) {
    return this.prisma.surveyFeedbackEnding.findUnique({
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
  ) {
    return this.prisma.surveyFeedbackEnding.update({
      where: { formId },
      data,
    });
  }

  async deleteSurveyEnding(formId: number) {
    return this.prisma.surveyFeedbackEnding.delete({ where: { formId } });
  }

  async getAllSurveyEnding(formId: number) {
    return this.prisma.surveyFeedbackEnding.findMany({
      where: { formId: formId },
    });
  }
}
