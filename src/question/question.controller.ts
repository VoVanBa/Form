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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role-auth.guard';
import { Roles } from 'src/auth/decorater/role.customize';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UpdateQuestionDto } from './dtos/update.question.dto';
import { QuestionType } from '@prisma/client';

@Controller('form')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
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
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.addAndUpdateQuestion(formId, updateQuestionDto);
  }
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get(':surveyId/questions')
  // async getQuestions(@Param('surveyId') surveyId: number) {
  //   return this.questionService.getAllQuestion(surveyId);
  // }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('upload-images/answer-option')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadAnswerOptionImages(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
      }

      const mediaIds =
        await this.questionService.uploadImagesAndSaveToDB(files);
      return {
        message: 'Images uploaded successfully',
        mediaIds,
      };
    } catch (error) {
      throw new HttpException(
        `Error uploading images: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('upload-image/question')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadQuestionImage(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
      }

      const mediaId = await this.questionService.uploadImage(file);

      return {
        message: 'Image uploaded successfully',
        mediaId,
      };
    } catch (error) {
      throw new HttpException(
        `Error uploading image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(
    'question/:questionId/answer-options/:optionAnwerId/surveyFeedBack/:surveyFeedBackId',
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

  @Delete('media/:mediaId')
  async deleteMediaById(@Param('mediaId') mediaId: number) {
    return await this.questionService.deleteMediaById(mediaId);
  }

  @Put('question/:id/form/:formId/up')
  async handleQuestionUp(
    @Param('id') questionId: number,
    @Param('formId') formId: number,
  ) {
    return this.questionService.handleQuestionOrderUp(questionId, formId);
  }

  @Put('question/:id/form/:formId/down')
  async handleQuestionDown(
    @Param('id') questionId: number,
    @Param('formId') formId: number,
  ) {
    return this.questionService.handleQuestionOrderDown(questionId, formId);
  }
}
