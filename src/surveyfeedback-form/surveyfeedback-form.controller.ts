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
} from '@nestjs/common';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { FormStatus } from 'src/models/enums/FormStatus';
import { UpdatesurveyFeedbackDto } from './dtos/update.form.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptors';

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

  @Get(':id/business/:businessId/client')
  getFormByIdForClient(
    @Param('id') id: number,
    @Param('businessId') businessId: number,
  ) {
    return this.surveyFeedbackFormService.getFormByIdForClient(id);
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
    return this.surveyFeedbackFormService.updateSurveyallowAnonymous(
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
  @HttpCode(HttpStatus.OK)
  async updateSurvey(
    @Param('formId') formId: number,
    @Body()
    body: {
      updateFormDto: UpdatesurveyFeedbackDto;
      questions: UpdateQuestionDto[];
    },
  ) {
    const { updateFormDto, questions } = body;
    const result = await this.surveyFeedbackFormService.saveForm(
      formId,
      updateFormDto,
      questions || [],
    );

    return result;
  }
}
