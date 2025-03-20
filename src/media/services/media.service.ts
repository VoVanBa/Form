import { Inject, Injectable } from '@nestjs/common';
import { CloudinaryUploadResult } from 'src/question/dtos/cloudinary.upload.result';
import { PrismaMediaRepository } from 'src/media/repositories/prisma-media.repository';
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
  async uploadImages(files: Express.Multer.File[]): Promise<number[]> {
    return await Promise.all(files.map((file) => this.uploadImage(file)));
  }

  async uploadImage(file: Express.Multer.File): Promise<number> {
    const { secure_url } = await this.uploadImageToCloudinary(file);
    const media = await this.prismaMediaRepository.createMedia(
      secure_url,
      file.originalname,
      file.mimetype,
      file.size,
    );
    return media.id;
  }

  async deleteMediaById(mediaId: number) {
    const media = await this.prismaMediaRepository.getMediaById(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }
    const result = await this.prismaMediaRepository.deleteMediaById(mediaId);
    return result;
  }
  async getMediaById(mediaId: number) {
    return this.prismaMediaRepository.getMediaById(mediaId);
  }
}
