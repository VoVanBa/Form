import { forwardRef, Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './services/media.service';
import { PrismaMediaRepository } from 'src/media/repositories/prisma-media.repository';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { CloudinaryProvider } from 'src/helper/providers/cloudinary.provider';
import { PrismaQuestionMediaRepository } from './repositories/prisma-question-media.repository';
import { AnswerOptionModule } from 'src/answer-option/answer-option.module';
import { QuestionModule } from 'src/question/question.module';
import { QuestionMediaService } from './services/question-media.service';
import { AnswerOptionMediaService } from './services/answer-option-media.service';
import { PrismaAnswerOptionMediaRepository } from './repositories/prisma-answer-option-media.repository';

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    PrismaMediaRepository,
    PrismaService,
    CloudinaryProvider,
    PrismaQuestionMediaRepository,
    QuestionMediaService,
    AnswerOptionMediaService,
    PrismaAnswerOptionMediaRepository,
  ],

  exports: [MediaService, QuestionMediaService, AnswerOptionMediaService],
  imports: [AnswerOptionModule, forwardRef(() => QuestionModule)],
})
export class MediaModule {}
