import { Controller, Get, Param } from '@nestjs/common';
import { AnswerOptionService } from './answer-option.service';

@Controller('answer-option')
export class AnswerOptionController {
  constructor(private readonly answerOptionService: AnswerOptionService) {}

  @Get('/:questionId')
  async findAllAnswerOptionByQuestionId(
    @Param('questionId') questionId: number,
  ): Promise<any> {
    return this.answerOptionService.getAllAnserOptionbyQuestionId(questionId);
  }
}
