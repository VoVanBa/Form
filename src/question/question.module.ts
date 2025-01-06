import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { CloudinaryProvider } from 'src/config/cloudinary.provider';
import { PrismaService } from 'src/config/prisma.service';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { PrismaFormRepository } from 'src/repositories/prisma-form.repository';
import { PrismaMediaRepository } from 'src/repositories/prisma-media.repository';

@Module({
  controllers: [QuestionController],
  providers: [
    PrismaService,
    QuestionService,
    CloudinaryProvider,
    PrismaQuestionRepository,
    PrismaFormRepository,
    PrismaMediaRepository,
  ],
})
export class QuestionModule {}
