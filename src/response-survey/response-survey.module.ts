import { Module } from '@nestjs/common';
import { ResponseSurveyController } from './response-survey.controller';
import { ResponseSurveyService } from './response-survey.service';
import { PrismaService } from 'src/config/prisma.service';
import { PrismasurveyFeedbackRepository } from 'src/repositories/prisma-survey-feeback.repository';
import { PrismaUserResponseRepository } from 'src/repositories/prisma-user-response.repository';
import { PrismaResponseQuestionRepository } from 'src/repositories/prisma-response-question.repository';
import { PrismaQuestionRepository } from 'src/repositories/prisma-question.repository';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaFormSettingRepository } from 'src/repositories/prisma-setting.repository';

@Module({
  controllers: [ResponseSurveyController],
  providers: [
    ResponseSurveyService,
    PrismaService,
    PrismasurveyFeedbackRepository,
    PrismaUserResponseRepository,
    PrismaResponseQuestionRepository,
    PrismaQuestionRepository,
    UsersService,
    JwtService,
    PrismaFormSettingRepository,
  ],
})
export class ResponseSurveyModule {}
