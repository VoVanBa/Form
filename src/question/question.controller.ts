import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QuestionService } from './service/question.service';
import { RolesGuard } from 'src/common/guards/role-auth.guard';
import { Roles } from 'src/common/decorater/role.customize';
import { UpdateQuestionDto } from './dtos/update.question.dto';
import { QuestionType } from 'src/question/entities/enums/QuestionType';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { QuestionConditionService } from './service/question-condition.service';

@Controller('form')
export class QuestionController {
  constructor(
    private questionService: QuestionService,
    private readonly questionConditionService: QuestionConditionService,
  ) {}

  @Get(':formId')
  async getAllQuestions(@Param('formId') formId: number) {
    return this.questionService.getAllQuestion(formId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/create-default/questions')
  async createDefaultQuestionConfigByAdmin() {
    return this.questionService.createDefaultQuestionConfigByAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/questions-type/setting')
  async getSettingByQuestionType(
    @Query('questionType') questionType: QuestionType,
  ) {
    return this.questionService.getSettingByQuestionType(questionType);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':formId/questions')
  async addQuestion(
    @Param('formId') formId: number,
    @Body() updateQuestionDto: UpdateQuestionDto[],
  ) {
    return this.questionService.addAndUpdateQuestions(
      formId,
      updateQuestionDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':formId/questions-from-index/:startIndex')
  async getAllQuestionsFromIndex(
    @Param('formId') formId: number,
    @Param('startIndex') startIndex: number,
  ) {
    return this.questionService.getQuestionsFromIndex(formId, startIndex);
  }

  @Delete(
    'question/:questionId/answer-options/:optionAnwerId/form/:surveyFeedBackId',
  )
  async deleteOptionAnwser(
    @Param('questionId') questionId: number,
    @Param('optionAnwerId') optionAnwerId: number,
    @Param('surveyFeedBackId') surveyFeedBackId: number,
  ) {
    return await this.questionService.deleteOptionAnwser(
      questionId,
      optionAnwerId,
      surveyFeedBackId,
    );
  }

  @Delete('question/:questionId/form/:formId')
  async deleteQuestionById(
    @Param('questionId') questionId: number,
    @Param('formId') formId: number,
  ) {
    return await this.questionService.deleteQuestionById(questionId, formId);
  }

  @Put(':formId/reorder/:questionId')
  async reorderQuestion(
    @Param('questionId') questionId: number,
    @Param('formId') formId: number,
    @Body('newIndex') newIndex: number,
  ) {
    return this.questionService.reorderQuestion(formId, questionId, newIndex);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':conditionId')
  async deleteCondition(
    @Param('conditionId') conditionId: number,
  ): Promise<void> {
    return this.questionConditionService.delete(conditionId);
  }
}
