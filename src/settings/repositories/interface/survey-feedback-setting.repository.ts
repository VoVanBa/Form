import { SurveyFeedbackSettings } from 'src/settings/entities/SurveyFeedbackSettings';

export interface SurveyFeedbackSettingRepository {
  getSurveyFeedbackSettings(): Promise<SurveyFeedbackSettings[]>;
  getSurveyFeedbackSettingById(
    id: string,
  ): Promise<SurveyFeedbackSettings | null>;
  createSurveyFeedbackSetting(
    setting: SurveyFeedbackSettings,
  ): Promise<SurveyFeedbackSettings>;
  updateSurveyFeedbackSetting(
    id: string,
    setting: SurveyFeedbackSettings,
  ): Promise<SurveyFeedbackSettings | null>;
  deleteSurveyFeedbackSetting(id: string): Promise<void>;
}
