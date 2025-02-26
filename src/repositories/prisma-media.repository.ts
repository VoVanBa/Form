import { Injectable } from '@nestjs/common';
import { IMediaRepository } from './i-repositories/media.repository';
import { PrismaService } from 'src/config/prisma.service';
import { Media } from 'src/models/Media';
import { QuestionOnMedia } from 'src/models/QuestionOnMedia';

@Injectable()
export class PrismaMediaRepository implements IMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMedia(
    url: string,
    fileName: string,
    mimeType: string,
    size: number,
    tx?: any,
  ): Promise<Partial<Media>> {
    const prisma = tx || this.prisma;
    return await prisma.media.create({
      data: {
        url,
        fileName,
        mimeType,
        size,
      },
    });
  }

  async createQuestionOnMedia(
    data: { mediaId: number; questionId: number },
    tx?: any,
  ): Promise<Partial<QuestionOnMedia>> {
    const prisma = tx || this.prisma;
    return await prisma.questionOnMedia.create({
      data,
    });
  }

  async createAnswerOptionOnMedia(
    data: { mediaId: number; answerOptionId: number | null }[],
    tx?: any,
  ) {
    const prisma = tx || this.prisma;
    return await prisma.answerOptionOnMedia.createMany({
      data,
    });
  }

  async getMediaById(id: number, tx?: any): Promise<Partial<Media> | null> {
    const prisma = tx || this.prisma;
    return await prisma.media.findUnique({
      where: { id },
    });
  }

  async getQuestionOnMediaByMediaId(
    mediaId: number,
    tx?: any,
  ): Promise<Partial<QuestionOnMedia> | null> {
    const prisma = tx || this.prisma;
    return await prisma.questionOnMedia.findFirst({
      where: { mediaId: mediaId },
    });
  }

  async updateQuestionOnMedia(questionId: number, mediaId: number, tx?: any) {
    const prisma = tx || this.prisma;
    return await prisma.questionOnMedia.update({
      where: { id: mediaId },
      data: {
        questionId,
      },
    });
  }

  async deleteMediaById(id: number, tx?: any): Promise<void> {
    const prisma = tx || this.prisma;
    await prisma.media.delete({
      where: { id },
    });
  }

  async updateAnswerOptionOnMedia(
    mediaId: number,
    answerOptionId: number,
    tx?: any,
  ) {
    const prisma = tx || this.prisma;
    return await prisma.answerOptionOnMedia.updateMany({
      where: { mediaId },
      data: {
        answerOptionId,
      },
    });
  }

  async getQuestionOnMediaByQuestionId(questionId: number, tx?: any) {
    const prisma = tx || this.prisma;
    const media = await prisma.questionOnMedia.findFirst({
      where: { questionId: questionId },
    });
    return media;
  }

  async getAnswerOptionByAnswerOptionId(answerOptionId: number, tx?: any) {
    const prisma = tx || this.prisma;
    const media = await prisma.answerOptionOnMedia.findFirst({
      where: { answerOptionId: answerOptionId },
    });
    return media;
  }
}
