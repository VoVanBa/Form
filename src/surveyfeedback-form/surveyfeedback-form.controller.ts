import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreatesurveyFeedbackDto } from './dtos/create.form.dto';
import { SurveyFeedackFormService } from './surveyfeedback-form.service';

@Controller('surveyfeedback-form')
export class SurveyFeedbackFormController {
  constructor(
    private readonly surveyFeedbackFormService: SurveyFeedackFormService,
  ) {}

  @Post()
  create(@Body() createSurveyFeedbackDto: CreatesurveyFeedbackDto) {
    return this.surveyFeedbackFormService.createForm(createSurveyFeedbackDto);
  }

  @Get('business/:businessId')
  findAll(@Param('businessId') businessId: number) {
    return this.surveyFeedbackFormService.getForms(businessId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.surveyFeedbackFormService.getFormById(id);
  }
}
