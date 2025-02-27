import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { BusinessModule } from './business/business.module';
import { QuestionModule } from './question/question.module';
import { SurveyFeedbackFormModule } from './surveyfeedback-form/surveyfeedback-form.module';
import { AdminModule } from './admin/admin.module';
import * as path from 'path';
import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n'; // Import I18nJsonLoader
import { SurveyFeedbackDataModule } from './survey-feedback-data/survey-feedback-data.module';
import { QuestionConditionModule } from './question-condition/question-condition.module';
import { TransactionInterceptor } from './common/interceptors/transaction.interceptors';
import { PrismaService } from './config/providers/prisma.service';
import { PrismaTransactionManager } from './common/prisma-transaction.manager';
import { MediaService } from './media/media.service';
import { MediaController } from './media/media.controller';
import { MediaModule } from './media/media.module';
import { AnswerOptionModule } from './answer-option/answer-option.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    MailModule,
    BusinessModule,
    QuestionModule,
    SurveyFeedbackFormModule,
    AdminModule,
    SurveyFeedbackDataModule,
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: path.join(process.cwd(), 'src', 'i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // Lấy từ query ?lang=vi
        AcceptLanguageResolver, // Lấy từ headers
      ],
    }),
    QuestionConditionModule,
    MediaModule,
    AnswerOptionModule,
  ],
  controllers: [AppController, MediaController],
  providers: [
    TransactionInterceptor,
    PrismaService, // Phải có PrismaService ở đây
    PrismaTransactionManager,
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR, // Đặt TransactionInterceptor làm global
      useClass: TransactionInterceptor,
    },
  ],
  exports: [PrismaService, PrismaTransactionManager],
})
export class AppModule {}
