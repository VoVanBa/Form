import { Injectable } from '@nestjs/common';
import { PrismaQuestionMediaRepository } from '../repositories/prisma-question-media.repository';
import { QuestionOnMedia } from 'src/media/entities/QuestionOnMedia';
import { MediaService } from './media.service';

@Injectable()
export class QuestionMediaService {
  constructor(
    private readonly questionMediaRepository: PrismaQuestionMediaRepository,
    private mediaService: MediaService,
  ) {}

  async createQuestionOnMedia(data: {
    mediaId: number;
    questionId: number;
  }): Promise<QuestionOnMedia> {
    return this.questionMediaRepository.createQuestionOnMedia(data);
  }

  async updateQuestionOnMedia(
    questionId: number,
    mediaId: number,
  ): Promise<QuestionOnMedia> {
    return this.questionMediaRepository.updateQuestionOnMedia(
      questionId,
      mediaId,
    );
  }

  async getQuestionOnMediaByMediaId(
    mediaId: number,
  ): Promise<QuestionOnMedia | null> {
    return this.questionMediaRepository.getQuestionOnMediaByMediaId(mediaId);
  }

  async getQuestionOnMediaByQuestionId(
    questionId: number,
  ): Promise<QuestionOnMedia | null> {
    return await this.questionMediaRepository.getQuestionOnMediaByQuestionId(
      questionId,
    );
  }

  async createQuestionMedia(image: Express.Multer.File) {
    const mediaId = await this.mediaService.uploadImage(image);
    await this.createQuestionOnMedia({
      mediaId: mediaId,
      questionId: null,
    });
  }
}
