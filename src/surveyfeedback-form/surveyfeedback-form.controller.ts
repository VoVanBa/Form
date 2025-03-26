import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  Headers,
} from '@nestjs/common';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { UpdateSettingDto } from 'src/settings/dtos/survey-feedback-settings.dto';
import { ResponseDto } from 'src/survey-feedback-data/dtos/response.dto';

@Controller('form')
export class SurveyFeedbackFormController {
  constructor(
    private readonly surveyFeedbackFormService: SurveyFeedackFormService,
    private userService: UsersService,
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

  @Get(':id/business')
  getFormByIdForFeedback(
    @Param('id') id: number,
  ) {
    return this.surveyFeedbackFormService.getBusinessFormById(id);
  }

  @Get(':id/business/:businessId/client/feedback')
  getFormByIdForClient(
    @Param('id') id: number,
    @Param('businessId') businessId: number,
  ) {
    return this.surveyFeedbackFormService.getClientFeedbackFormById(id);
  }

  @Post(':id/back')
  async goBackToPreviousQuestion(
    @Param('id') id: number,
    @Body() backDto: { currentQuestionId: number },
    @Req() request?,
    @Headers('authorization') jwt?: string,
  ) {
    let user = null;
    if (jwt) {
      user = await this.userService.getUserByJwt(jwt);
    }
    if (user) {
      return this.surveyFeedbackFormService.goBackToPreviousSurveyQuestion(
        id,
        backDto.currentQuestionId,
        request,
        user.id,
      );
    }
    return this.surveyFeedbackFormService.goBackToPreviousSurveyQuestion(
      id,
      backDto.currentQuestionId,
      request,
    );
  }

  @Get(':id/business/:businessId/client')
  async getForm(
    @Param('id') id: number,
    @Req() request?: Request,
    @Headers('authorization') jwt?: string,
  ): Promise<any> {
    let user = null;
    if (jwt) {
      user = await this.userService.getUserByJwt(jwt);
    }

    return this.surveyFeedbackFormService.getSurveyForm(id, {
      user: user ? user.id : null,
      sessionId: (request.headers['x-session-id'] as string) || null,
    });
  }

  @Post(':id/submit-response')
  async submitResponseForClient(
    @Param('id') id: number,
    @Body()
    responseDto: ResponseDto,
    @Req() request?: any,
    @Headers('authorization') jwt?: string,
  ) {
    let user = null;
    if (jwt) {
      user = await this.userService.getUserByJwt(jwt);
    }
    if (user) {
      return this.surveyFeedbackFormService.submitSurvey(
        id,
        responseDto,
        request,
        user.id,
      );
    }
    return this.surveyFeedbackFormService.submitSurvey(
      id,
      responseDto,
      request,
    );
  }

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
    @Body('setting') setting: UpdateSettingDto,
  ) {
    await this.surveyFeedbackFormService.updateFormSettings(
      formId,
      businessId,
      setting,
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
  async updateSurvey(
    @Param('formId') formId: number,
    @Body()
    body: {
      form: UpdatesurveyFeedbackDto;
      questions: UpdateQuestionDto[];
    },
  ) {
    const { form, questions } = body;
    const result = await this.surveyFeedbackFormService.saveForm(
      formId,
      form,
      questions || [],
    );

    return result;
  }
}
