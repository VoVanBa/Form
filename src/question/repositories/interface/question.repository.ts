import { Question } from 'src/question/entities/Question';
import { AddQuestionDto } from 'src/question/dtos/add.question.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { SurveyFeedbackSettings } from 'src/settings/entities/SurveyFeedbackSettings';
import { QuestionConfiguration } from 'src/settings/entities/QuestionConfiguration';
import { QuestionType } from 'src/question/entities/enums/QuestionType';
import { BusinessQuestionConfiguration } from 'src/settings/entities/BusinessQuestionConfiguration';

export interface QuestionRepository {
  findAllQuestion(formId: number, tx?: any): Promise<Partial<Question>[]>;

  uploadImagesAndSaveToDB(
    files: Express.Multer.File[],
    tx?: any,
  ): Promise<void>;

  uploadImage(image: Express.Multer.File, tx?: any): Promise<number>;

  deleteQuestionById(questionId: number, tx?: any): Promise<void>;

  findQuestionBySortOrder(
    sortOrder: number,
    tx?: any,
  ): Promise<Question | null>;

  getQuessionById(questionId: number, tx?: any): Promise<Question | null>;

  updateQuestion(
    questionId: number,
    data: UpdateQuestionDto,
    tx?: any,
  ): Promise<Question>;

  createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
    formId: number,
    tx?: any,
  ): Promise<BusinessQuestionConfiguration>;

  getSettingByQuestionType(
    questionType: QuestionType,
    tx?: any,
  ): Promise<QuestionConfiguration | null>;

  createDefaultQuestionConfigByAdmin(
    key: string,
    settings: any,
    tx?: any,
  ): Promise<SurveyFeedbackSettings>;

  createQuestion(
    formId: number,
    data: AddQuestionDto,
    sortOrder: number,
    tx?: any,
  ): Promise<Question>;

  getBusinessQuestionConfigurationByQuestionId(
    questionId: number,
    formId: number,
    tx?: any,
  ): Promise<BusinessQuestionConfiguration | null>;

  updateQuestionSetting(
    questionId: number,
    settings: any,
    formId: number,
    tx?: any,
  ): Promise<SurveyFeedbackSettings>;

  updateIndexQuestion(
    questionId: number,
    index: number,
    tx?: any,
  ): Promise<void>;

  getSettingByFormId(
    formId: number,
    tx?: any,
  ): Promise<BusinessQuestionConfiguration[]>;

  shiftIndexes(
    formId: number,
    fromIndex: number,
    toIndex: number,
    direction: 'up' | 'down',
    tx?: any,
  ): Promise<any>; // Updated to match implementation return type

  getMaxQuestionIndex(formId: number, tx?: any): Promise<number>; // Added missing method

  countQuestions(formId: number, tx?: any): Promise<number>; // Added missing method

  bulkUpdateIndexes(
    questions: { id: number; index: number }[],
    tx?: any,
  ): Promise<any>; // Updated to match implementation return type
}
