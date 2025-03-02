import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { UseTransaction } from 'src/common/decorater/transaction.decorator';
import { Request } from 'express';

@Controller('form')
export class SurveyFeedbackFormController {
  constructor(
    private readonly surveyFeedbackFormService: SurveyFeedackFormService,
  ) {}

  @Post(':businessId')
  create(
    @Param('businessId') businessId: number,
    @Body() createSurveyFeedbackDto: CreatesurveyFeedbackDto,
  ) {
    return this.surveyFeedbackFormService.createForm(
      createSurveyFeedbackDto,
      businessId,
    );
  }

  @Get('business/:businessId')
  findAll(@Param('businessId') businessId: number) {
    return this.surveyFeedbackFormService.getForms(businessId);
  }

  @Get(':id/business/:businessId')
  getFormByIdForBusiness(
    @Param('id') id: number,
    @Param('businessId') businessId: number,
  ) {
    return this.surveyFeedbackFormService.getFormByIdForBusiness(id);
  }

  @Get(':id/business/:businessId/client/feedback')
  getFormByIdForClient(
    @Param('id') id: number,
    @Param('businessId') businessId: number,
  ) {
    return this.surveyFeedbackFormService.getFormByIdForClientFeedBack(id);
  }

  @Get(':id/business/:businessId/client')
  async getForm(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<any> {
    // Truyền request để lấy userId (nếu đăng nhập) hoặc sessionId (nếu có)
    return this.surveyFeedbackFormService.getFormByIdForClient(id, {
      user: request.user, 
      sessionId: request.headers['x-session-id'] as string, // Lấy từ header
    });
  }

  // @Put(':formId')
  // updateForm(
  //   @Param('formId') formId: number,
  //   @Body() data: UpdatesurveyFeedbackDto,
  // ) {
  //   return this.surveyFeedbackFormService.updateForm(formId, data);
  // }

  @Delete(':formId')
  deleteForm(@Param('formId') formId: number) {
    return this.surveyFeedbackFormService.deleteForm(formId);
  }

  @Put(':id/allow-anonymous')
  async updateSurveyallowAnonymous(
    @Param('id') surveyId: number,
    @Body('allowAnonymous') allowAnonymous: boolean,
  ) {
    return this.surveyFeedbackFormService.updateSurveyAllowAnonymous(
      surveyId,
      allowAnonymous,
    );
  }

  @Put(':formId/business/:businessId/setting')
  async updateFormSettings(
    @Param('formId') formId: number,
    @Param('businessId') businessId: number,
    @Body()
    body: {
      settings: {
        key: string;
        value: any;
      }[];
    },
  ) {
    await this.surveyFeedbackFormService.updateFormSettings(
      formId,
      businessId,
      body.settings,
    );
    return { message: 'Survey settings updated successfully' };
  }
  @Get(':formId/business/:businessId/setting')
  async getAllBusinessSettings(
    @Param('formId') formId: number,
    @Param('businessId') businessId: number,
  ) {
    return this.surveyFeedbackFormService.getAllBusinessSettings(
      businessId,
      formId,
    );
  }

  @Post(':formId/business/:businessId/duplicate')
  async duplicateSurvey(
    @Param('formId') formId: number,
    @Param('businessId') businessId: number,
  ) {
    return this.surveyFeedbackFormService.duplicateSurvey(formId, businessId);
  }

  @Put(':formId')
  @UseTransaction()
  async updateSurvey(
    @Param('formId') formId: number,
    @Body()
    body: {
      form: UpdatesurveyFeedbackDto;
      questions: UpdateQuestionDto[];
    },
    @Req() req,
  ) {
    const { form, questions } = body;
    const result = await this.surveyFeedbackFormService.saveForm(
      formId,
      form,
      questions || [],
      req,
    );

    return result;
  }
}
