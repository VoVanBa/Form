import { Module } from '@nestjs/common';
import { FeedbackResponseController } from './feedback-response.controller';
import { FeedbackResponseService } from './feedback-response.service';
import { PrismaService } from 'src/config/prisma.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [FeedbackResponseController],
  providers: [FeedbackResponseService, PrismaService, UsersService, JwtService],
})
export class FeedbackResponseModule {}
