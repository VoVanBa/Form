import { Module } from '@nestjs/common';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { PrismaService } from 'src/config/prisma.service';
import { QuestionService } from 'src/question/question.service';
import { CloudinaryProvider } from 'src/config/cloudinary.provider';

@Module({
  controllers: [SurveyController],
  providers: [SurveyService, PrismaService, CloudinaryProvider],
})
export class SurveyModule {}
