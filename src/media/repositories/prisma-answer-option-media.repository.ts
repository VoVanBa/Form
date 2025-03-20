import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { AnswerOptionOnMedia } from 'src/media/entities/AnswerOptionOnMedia';
import { AnswerOptionMediaRepository } from './interface/answer-option-media.repository';

@Injectable()
export class PrismaAnswerOptionMediaRepository
  implements AnswerOptionMediaRepository
{
  constructor(private prisma: PrismaService) {}
  async updateAnswerOptionOnMedia(mediaId: number, answerOptionId: number) {
    const response = await this.prisma.answerOptionOnMedia.update({
      where: { mediaId, answerOptionId },
      data: {
        answerOptionId,
      },
    });
  }

  async getAnswerOptionByAnswerOptionId(
    answerOptionId: number,
  ): Promise<AnswerOptionOnMedia | null> {
    const media = await this.prisma.answerOptionOnMedia.findFirst({
      where: { answerOptionId: answerOptionId },
    });
    return new AnswerOptionOnMedia(media);
  }

  async createAnswerOptionOnMedia(
    data: { mediaId: number; answerOptionId: number | null }[],
  ): Promise<AnswerOptionOnMedia[]> {
    const response = await this.prisma.answerOptionOnMedia.createMany({
      data,
    });

    return data.map((item) => new AnswerOptionOnMedia(item));
  }

  async bulkUpdateAnswerOptionOnMedia(
    updates: { mediaId: number; answerOptionId: number | null }[],
  ): Promise<void> {
    const updatePromises = updates.map((update) =>
      this.prisma.answerOptionOnMedia.updateMany({
        where: { mediaId: update.mediaId },
        data: { answerOptionId: update.answerOptionId },
      }),
    );

    await Promise.all(updatePromises);
  }
}
