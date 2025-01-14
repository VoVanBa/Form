import { AddQuestionDto } from 'src/question/dtos/add.question.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';

export interface QuestionRepository {
  findAllQuestion(formId: number): Promise<any>;
  uploadImagesAndSaveToDB(files: Express.Multer.File[]): Promise<any>;
  uploadImage(image: Express.Multer.File): Promise<number>;
  deleteQuestionById(questionId: number): Promise<void>;
  findQuestionBySortOrder(questionId: number): Promise<any>;
  getQuessionById(questionId: number);
  updateQuestion(questionId: number, data: UpdateQuestionDto): Promise<any>;
  createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
    formId: number,
  ): Promise<any>;
  getSettingByQuestionType(questionType: string): Promise<any>;
  createDefaultQuestionConfigByAdmin(key: any, settings: any): Promise<any>;
  createQuestion(
    formId: number,
    data: AddQuestionDto,
    // settingId: number,
    sortOrder: number,
  );
  getBusinessQuestionConfigurationByQuestionId(
    questionId: number,
    formId: number,
  );
  updateQuestionSetting(questionId: number, settings: any, formId: number);
  updateIndexQuestion(questionId: number, index: number);
}
