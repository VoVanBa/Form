import { Inject, Injectable } from '@nestjs/common';
import { CloudinaryUploadResult } from 'src/question/dtos/cloudinary.upload.result';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';
import { v2 as cloudinary } from 'cloudinary';
@Injectable()
export class MediaService {
  constructor(
    private prismaMediaRepository: PrismaMediaRepository,
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary,
  ) {}
  private async uploadImageToCloudinary(
    file: Express.Multer.File,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        })
        .end(file.buffer);
    });
  }
  async uploadImages(files: Express.Multer.File[]): Promise<any> {
    const uploadResults = await Promise.all(
      files.map((file) => this.uploadImageToCloudinary(file)),
    );
    const mediaPromises = uploadResults.map((result, index) => {
      const file = files[index];
      return this.prismaMediaRepository.createMedia(
        result.secure_url,
        file.originalname,
        file.mimetype,
        file.size,
      );
    });
    const media = await Promise.all(mediaPromises);
    const mediaIds = media.map((m) => m.id);

    return mediaIds;
  }

  async uploadImage(image: Express.Multer.File): Promise<number> {
    const result = await this.uploadImageToCloudinary(image);
    const media = await this.prismaMediaRepository.createMedia(
      result.secure_url,
      image.originalname,
      image.mimetype,
      image.size,
    );

    return media.id;
  }

  async getQuestionOnMediaByQuestionId(questionId: number, tx?: any) {
    return await this.prismaMediaRepository.getQuestionOnMediaByQuestionId(
      questionId,
      tx,
    );
  }
  async deleteMediaById(mediaId: number, tx?: any) {
    return await this.prismaMediaRepository.deleteMediaById(mediaId, tx);
  }
  async getQuestionOnMediaByMediaId(mediaId: number, tx: any) {
    return await this.prismaMediaRepository.getQuestionOnMediaByMediaId(
      mediaId,
      tx,
    );
  }

  async updateQuestionOnMedia(questionId: number, mediaId: number, tx: any) {
    return await this.prismaMediaRepository.updateQuestionOnMedia(
      questionId,
      mediaId,
      tx,
    );
  }

  async updateAnswerOptionOnMedia(
    answerOptionId: number,
    mediaId: number,
    tx: any,
  ) {
    return await this.prismaMediaRepository.updateAnswerOptionOnMedia(
      answerOptionId,
      mediaId,
      tx,
    );
  }

  async createAnswerOptionOnMedia(
    data: { mediaId: number; answerOptionId: number | null }[],
    tx?: any,
  ) {
    return await this.prismaMediaRepository.createAnswerOptionOnMedia(data, tx);
  }

  async createQuestionOnMedia(
    data: { mediaId: number; questionId: number },
    tx?: any,
  ) {
    return await this.prismaMediaRepository.createQuestionOnMedia(data, tx);
  }

  async getMediaById(mediaId: number, tx?: any) {
    return await this.prismaMediaRepository.getMediaById(mediaId, tx);
  }
}
