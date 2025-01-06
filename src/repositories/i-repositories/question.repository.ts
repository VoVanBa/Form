import { AddQuestionDto } from 'src/question/dtos/add.question.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';

export interface QuestionRepository {
  findAllQuestion(formId: number): Promise<any>;
  uploadImagesAndSaveToDB(files: Express.Multer.File[]): Promise<any>;
  uploadImage(image: Express.Multer.File): Promise<number>;
  deleteQuestionById(questionId: number): Promise<void>;
  handleQuestionOrderUp(questionId: number): Promise<any>;
  handleQuestionOrderDown(questionId: number): Promise<any>;
  getQuessionById(questionId: number): Promise<any>;
  getQuestionOnMediaById(mediaId: number): Promise<any>;
  updateQuestion(questionId: number, data: UpdateQuestionDto): Promise<any>;
  createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
  ): Promise<any>;
  getSettingByQuestionType(questionType: string): Promise<any>;
  createDefaultQuestionConfigByAdmin(key: any, settings: any): Promise<any>;
  createQuestion(
    formId: number,
    data: AddQuestionDto,
    // settingId: number,
    sortOrder: number,
  );
  getBusinessQuestionConfigurationByQuestionId(questionId: number);
}
