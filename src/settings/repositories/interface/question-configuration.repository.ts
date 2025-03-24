import { QuestionConfiguration } from 'src/settings/entities/QuestionConfiguration';

export interface QuestionConfigurationRepository {
  getQuestionConfiguration(id: string): Promise<QuestionConfiguration>;
  saveQuestionConfiguration(config: QuestionConfiguration): Promise<void>;
  updateQuestionConfiguration(
    id: string,
    config: QuestionConfiguration,
  ): Promise<void>;
  deleteQuestionConfiguration(id: string): Promise<void>;
}
