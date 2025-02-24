import { Question } from 'src/models/Question';
import { AddQuestionDto } from 'src/question/dtos/add.question.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { BusinessQuestionConfiguration } from 'src/models/BusinessQuestionConfiguration';
import { SurveyFeedbackSettings } from 'src/models/SurveyFeedbackSettings';
import { QuestionConfiguration } from 'src/models/QuestionConfiguration';
import { QuestionType } from 'src/models/enums/QuestionType';

export interface QuestionRepository {
  findAllQuestion(formId: number): Promise<Partial<Question>[]>;

  uploadImagesAndSaveToDB(files: Express.Multer.File[]): Promise<void>;

  uploadImage(image: Express.Multer.File): Promise<number>;

  deleteQuestionById(questionId: number): Promise<void>;

  findQuestionBySortOrder(questionId: number): Promise<Question | null>;

  getQuessionById(questionId: number): Promise<Question | null>;

  updateQuestion(
    questionId: number,
    data: UpdateQuestionDto,
  ): Promise<Question>;

  createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
    formId: number,
  ): Promise<BusinessQuestionConfiguration>;

  getSettingByQuestionType(
    questionType: QuestionType,
  ): Promise<QuestionConfiguration | null>;

  createDefaultQuestionConfigByAdmin(
    key: string,
    settings: any,
  ): Promise<SurveyFeedbackSettings>;

  createQuestion(
    formId: number,
    data: AddQuestionDto,
    sortOrder: number,
  ): Promise<Question>;

  getBusinessQuestionConfigurationByQuestionId(
    questionId: number,
    formId: number,
  ): Promise<BusinessQuestionConfiguration | null>;

  updateQuestionSetting(
    questionId: number,
    settings: any,
    formId: number,
  ): Promise<SurveyFeedbackSettings>;

  updateIndexQuestion(questionId: number, index: number): Promise<void>;

  getSettingByFormId(formId: number): Promise<BusinessQuestionConfiguration[]>;

  shiftIndexes(
    formId: number,
    questionId: number,
    newIndex: number,
    direction: 'up' | 'down',
  );
}
