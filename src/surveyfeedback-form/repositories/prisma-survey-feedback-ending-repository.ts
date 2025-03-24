import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { UpdateFormEndingDto } from '../dtos/update.form.ending.dto';

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

  async getSurveyEndingBySurveyId(formId: number, tx?: any) {
    return this.prisma.surveyFeedbackEnding.findUnique({
      where: { formId: formId },
      include: { media: true },
    });
  }

  async updateSurveyEnding(formId: number, data: UpdateFormEndingDto) {
    return this.prisma.surveyFeedbackEnding.update({
      where: { formId },
      data: {
        message: data.endingMessage,
        redirectUrl: data.endingRedirectUrl,
        mediaId: data.endingMediaId,
      },
    });
  }

  async deleteSurveyEnding(formId: number, tx?: any) {
    return this.prisma.surveyFeedbackEnding.delete({ where: { formId } });
  }

  async getAllSurveyEnding(formId: number, tx?: any) {
    return this.prisma.surveyFeedbackEnding.findMany({
      where: { formId: formId },
    });
  }
}
