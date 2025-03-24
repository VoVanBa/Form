import { Controller, Get } from '@nestjs/common';
import { SurveyFeedbackSettingService } from './service/survey-feedback-setting.service';

@Controller('settings')
export class SettingsController {
  constructor(private formSettingService: SurveyFeedbackSettingService) {}

  @Get(':formId')
  async getAllSetting(formId: number) {
    return await this.formSettingService.getAllSetting(formId);
  }
}
