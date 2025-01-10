import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';
import { FormStatus } from '@prisma/client';

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
  findOne(@Param('id') id: number, @Param('businessId') businessId: number) {
    return this.surveyFeedbackFormService.getFormById(id, businessId);
  }

  @Put(':formId/businessId/:businessId/status')
  updateStatus(
    @Query('status') status: FormStatus,
    @Param('formId') formId: number,
    @Param('businessId') businessId: number,
  ) {
    return this.surveyFeedbackFormService.updateStatus(
      status,
      formId,
      businessId,
    );
  }

  @Delete(':formId')
  deleteForm(@Param('formId') formId: number) {
    return this.surveyFeedbackFormService.deleteForm(formId);
  }

  // @Put(':id/allow-anonymous')
  // async updateSurveyallowAnonymous(
  //   @Param('id') surveyId: number,
  //   @Body('allowAnonymous') allowAnonymous: boolean,
  // ) {
  //   return this.surveyService.updateSurveyallowAnonymous(
  //     surveyId,
  //     allowAnonymous,
  //   );
  // }
}
