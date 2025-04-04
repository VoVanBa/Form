import { forwardRef, Module } from '@nestjs/common';
import { SurveyFeedbackDataController } from './survey-feedback-data.controller';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/prisma-response-question.repository';
import { PrismaQuestionRepository } from 'src/question/repositories/prisma-question.repository';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SurveyFeedbackDataService } from './survey-feedback-data.service';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { QuestionModule } from 'src/question/question.module';
import { PrismaSurveyFeedbackRepository } from 'src/surveyfeedback-form/repositories/prisma-survey-feeback.repository';
import { SurveyFeedbackFormModule } from 'src/surveyfeedback-form/surveyfeedback-form.module';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  controllers: [SurveyFeedbackDataController],
  providers: [
    PrismaService,
    PrismaSurveyFeedbackRepository,
    PrismaUserResponseRepository,
    PrismaResponseQuestionRepository,
    PrismaQuestionRepository,
    UsersService,
    JwtService,
    SurveyFeedbackDataService,
  ],
  exports: [SurveyFeedbackDataService],
  imports: [
    forwardRef(() => QuestionModule),
    forwardRef(() => SurveyFeedbackFormModule),
    forwardRef(() => SettingsModule),
  ],
})
export class SurveyFeedbackDataModule {}
