import { Module } from '@nestjs/common';
import { AnswerOptionService } from './answer-option.service';
import { AnswerOptionController } from './answer-option.controller';
import { PrismaAnswerOptionRepository } from 'src/repositories/prisma-anwser-option.repository';
import { PrismaService } from 'src/config/providers/prisma.service';

@Module({
  providers: [AnswerOptionService, PrismaAnswerOptionRepository, PrismaService],
  controllers: [AnswerOptionController],
  exports: [AnswerOptionService],
})
export class AnswerOptionModule {}
