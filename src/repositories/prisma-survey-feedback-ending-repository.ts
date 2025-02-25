import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';

// prisma-survey-ending.repository.ts
@Injectable()
export class PrismaSurveyEndingRepository {
  constructor(private prisma: PrismaService) {}

  async createSurveyEnding(data: {
    surveyId: number;
    message: string;
    redirectUrl?: string;
    mediaId?: number;
  }) {
    return this.prisma.surveyFeedbackEnding.create({ data });
  }

  async getSurveyEndingBySurveyId(surveyId: number) {
    return this.prisma.surveyFeedbackEnding.findUnique({
      where: { surveyId },
      include: { media: true },
    });
  }
}
