import { Injectable } from '@nestjs/common';
import { PrismaAnswerOptionMediaRepository } from '../repositories/prisma-answer-option-media.repository';
import { AnswerOptionOnMedia } from 'src/media/entities/AnswerOptionOnMedia';
import { MediaService } from './media.service';

@Injectable()
export class AnswerOptionMediaService {
  constructor(
    private readonly answerOptionMediaRepository: PrismaAnswerOptionMediaRepository,
    private mediaService: MediaService,
  ) {}

  async updateAnswerOptionOnMedia(
    mediaId: number,
    answerOptionId: number,
  ): Promise<void> {
    return this.answerOptionMediaRepository.updateAnswerOptionOnMedia(
      mediaId,
      answerOptionId,
    );
  }

  async getAnswerOptionByAnswerOptionId(
    answerOptionId: number,
  ): Promise<AnswerOptionOnMedia | null> {
    return this.answerOptionMediaRepository.getAnswerOptionByAnswerOptionId(
      answerOptionId,
    );
  }

  async createAnswerOptionOnMedia(
    data: { mediaId: number; answerOptionId: number | null }[],
  ): Promise<AnswerOptionOnMedia[]> {
    return this.answerOptionMediaRepository.createAnswerOptionOnMedia(data);
  }
  async bulkUpdateAnswerOptionOnMedia(
    updates: { mediaId: number; answerOptionId: number | null }[],
  ): Promise<void> {
    return this.answerOptionMediaRepository.bulkUpdateAnswerOptionOnMedia(
      updates,
    );
  }

  async createAnwerOptionMedia(image: Express.Multer.File[]) {
    const mediaIds = await this.mediaService.uploadImages(image);
    await this.createAnswerOptionOnMedia(
      mediaIds.map((mediaId) => ({ mediaId, answerOptionId: null })),
    );
  }
}
