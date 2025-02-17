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
  ): Promise<Partial<Media>> {
    return await this.prisma.media.create({
      data: {
        url,
        fileName,
        mimeType,
        size,
      },
    });
  }

  async createQuestionOnMedia(data: {
    mediaId: number;
    questionId: number;
  }): Promise<Partial<QuestionOnMedia>> {
    return await this.prisma.questionOnMedia.create({
      data,
    });
  }

  async createAnswerOptionOnMedia(
    data: { mediaId: number; answerOptionId: number | null }[],
  ) {
    return await this.prisma.answerOptionOnMedia.createMany({
      data,
    });
  }

  async getMediaById(id: number): Promise<Partial<Media> | null> {
    return await this.prisma.media.findUnique({
      where: { id },
    });
  }

  async getQuestionOnMediaByMediaId(
    mediaId: number,
  ): Promise<Partial<QuestionOnMedia> | null> {
    return await this.prisma.questionOnMedia.findFirst({
      where: { mediaId: mediaId },
    });
  }

  async updateQuestionOnMedia(questionId: number, mediaId: number) {
    return await this.prisma.questionOnMedia.update({
      where: { id: mediaId },
      data: {
        questionId,
      },
    });
  }
  async deleteMediaById(id: number): Promise<void> {
    await this.prisma.media.delete({
      where: { id },
    });
  }

  async updateAnswerOptionOnMedia(mediaId: number, answerOptionId: number) {
    return await this.prisma.answerOptionOnMedia.updateMany({
      where: { mediaId },
      data: {
        answerOptionId,
      },
    });
  }

  async getQuestionOnMediaByQuestionId(questionId: number) {
    const media = await this.prisma.questionOnMedia.findFirst({
      where: { questionId: questionId },
    });
    return media;
  }

  async getAnswerOptionByAnswerOptionId(answerOptionId: number) {
    const media = await this.prisma.answerOptionOnMedia.findFirst({
      where: { answerOptionId: answerOptionId },
    });
    return media;
  }
}
