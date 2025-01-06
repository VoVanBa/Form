import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { PrismaService } from 'src/config/prisma.service';
import { CloudinaryProvider } from 'src/config/cloudinary.provider';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    FeedbackService,
    PrismaService,
    CloudinaryProvider,
    MailService,
    UsersService,
    JwtService,
  ],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
