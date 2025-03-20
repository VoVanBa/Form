import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { QuestionOnMedia } from 'src/media/entities/QuestionOnMedia';
import { QuestionMediaRepository } from './interface/question-media.repository';

@Injectable()
export class PrismaQuestionMediaRepository implements QuestionMediaRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createQuestionOnMedia(data: {
    mediaId: number;
    questionId: number;
  }): Promise<QuestionOnMedia> {
    const response = await this.prisma.questionOnMedia.create({
      data,
    });
    return new QuestionOnMedia(response);
  }
  async updateQuestionOnMedia(questionId: number, mediaId: number) {
    const response = await this.prisma.questionOnMedia.upsert({
      where: { questionId }, 
      update: { mediaId }, 
      create: { questionId, mediaId }, // 🔹 Tạo mới nếu chưa có
    });

    return new QuestionOnMedia(response);
  }

  async getQuestionOnMediaByMediaId(
    mediaId: number,
  ): Promise<QuestionOnMedia | null> {
    const response = await this.prisma.questionOnMedia.findFirst({
      where: { mediaId: mediaId },
    });
    return new QuestionOnMedia(response);
  }

  async getQuestionOnMediaByQuestionId(
    questionId: number,
  ): Promise<QuestionOnMedia | null> {
    console.log(questionId, 'jsjquestuonsjajasjas');

    const media = await this.prisma.questionOnMedia.findFirst({
      where: { questionId: questionId },
    });
    console.log(media, 'jsjsjajasjas');
    return new QuestionOnMedia(media);
  }
}
