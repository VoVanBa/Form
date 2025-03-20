import { Injectable } from '@nestjs/common';
import { IMediaRepository } from './interface/media.repository';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { Media } from '../entities/Media';

@Injectable()
export class PrismaMediaRepository implements IMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMedia(
    url: string,
    fileName: string,
    mimeType: string,
    size: number,
  ): Promise<Media> {
    const response = await this.prisma.media.create({
      data: {
        url,
        fileName,
        mimeType,
        size,
      },
    });
    return new Media(response);
  }

  async getMediaById(id: number): Promise<Media | null> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });
    return new Media(media);
  }

  async deleteMediaById(id: number): Promise<void> {
    await this.prisma.media.delete({
      where: { id },
    });
  }
}
