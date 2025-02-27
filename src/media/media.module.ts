import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';
import { PrismaService } from 'src/config/providers/prisma.service';
import { CloudinaryProvider } from 'src/config/providers/cloudinary.provider';

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    PrismaMediaRepository,
    PrismaService,
    CloudinaryProvider,
  ],
  exports: [MediaService],
})
export class MediaModule {}
