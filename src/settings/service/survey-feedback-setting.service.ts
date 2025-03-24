import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSurveyFeedbackSettingRepository } from '../repositories/prisma-survey-feedback-setting.repository';
import { UpdateSettingDto } from '../dtos/survey-feedback-settings.dto';
import { I18nService } from 'nestjs-i18n';
import { SurveyFeedbackDataService } from 'src/survey-feedback-data/survey-feedback-data.service';

@Injectable()
export class SurveyFeedbackSettingService {
  constructor(
    private readonly repository: PrismaSurveyFeedbackSettingRepository,
    @Inject(forwardRef(() => SurveyFeedbackDataService))
    private readonly response: SurveyFeedbackDataService,
    private readonly i18n: I18nService,
  ) {}

  async getSettingById(id: number) {
    const setting = await this.repository.findOne(id);
    if (!setting) {
      throw new NotFoundException();
    }
    return setting;
  }

  async getAllSetting(formId: number) {
    return await this.repository.findAll(formId);
  }

  async updateSetting(id: number, data: UpdateSettingDto) {
    await this.getSettingById(id);
    return await this.repository.update(id, data);
  }

  async validateFormSetting(formId: number, responseOptions: any) {
    const currentDate = new Date();
    const totalResponses = await this.response.totalResponses(formId);

    for (const formSetting of responseOptions) {
      const { key, value } = formSetting;

      switch (key) {
        case 'CLOSE_ON_RESPONSE_LIMIT':
          const limit = parseInt(value, 10);
          if (!isNaN(limit) && totalResponses >= limit) {
            throw new BadRequestException({
              message: this.i18n.translate('errors.RESPONSELIMITEXCEEDED', {
                args: { key },
              }),
              key,
            });
          }
          break;

        case 'RELEASE_ON_DATE':
          const releaseDate = new Date(value);
          if (!isNaN(releaseDate.getTime()) && releaseDate > currentDate) {
            throw new BadRequestException({
              message: this.i18n.translate('errors.SURVEYNOTYETRELEASED', {
                args: { date: value, key },
              }),
              key,
            });
          }
          break;

        case 'CLOSE_ON_DATE':
          const closeDate = new Date(value);
          if (!isNaN(closeDate.getTime()) && closeDate <= currentDate) {
            throw new BadRequestException({
              message: this.i18n.translate('errors.SURVEYCLOSED', {
                args: { date: value, key },
              }),
              key,
            });
          }
          break;

        default:
          console.warn(`⚠️ Chưa xử lý rule: ${key}`);
      }
    }
  }
}
