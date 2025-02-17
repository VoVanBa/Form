import { Inject, Injectable } from '@nestjs/common';
import { AddQuestionDto } from '../question/dtos/add.question.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { PrismaService } from 'src/config/prisma.service';
import { Question } from 'src/models/Question';
import { QuestionType } from 'src/models/enums/QuestionType';
import { BusinessQuestionConfiguration } from 'src/models/BusinessQuestionConfiguration';
import { SurveyFeedbackSettings } from 'src/models/SurveyFeedbackSettings';
import { Media } from 'src/models/Media';
import { QuestionRepository } from './i-repositories/question.repository';
import { QuestionConfig } from 'src/response-customization/surveyfeedback.response';
import { QuestionConfiguration } from 'src/models/QuestionConfiguration';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async updateQuestion(
    questionId: number,
    data: UpdateQuestionDto,
  ): Promise<Question> {
    const type = data.questionType as QuestionType;
    const updateQuestion = await this.prismaService.question.update({
      where: { id: questionId },
      data: {
        headline: data.headline,
        questionType: type,
      },
    });
    return Question.fromPrisma(updateQuestion);
  }

  async getSettingByFormId(
    formId: number,
  ): Promise<BusinessQuestionConfiguration[]> {
    const data =
      await this.prismaService.businessQuestionConfiguration.findMany({
        where: {
          formId: formId,
        },
      });
    return data.map((setting) => {
      return BusinessQuestionConfiguration.fromPrisma(setting);
    });
  }

  async updateQuestionSetting(
    questionId: number,
    settings: any,
    formId: number,
  ): Promise<SurveyFeedbackSettings> {
    const setting =
      await this.prismaService.businessQuestionConfiguration.update({
        where: { questionId, formId },
        data: { settings },
      });
    return SurveyFeedbackSettings.fromPrisma(setting);
  }

  async getBusinessQuestionConfigurationByQuestionId(
    questionId: number,
    formId: number,
  ): Promise<BusinessQuestionConfiguration | null> {
    const data =
      await this.prismaService.businessQuestionConfiguration.findUnique({
        where: { questionId, formId },
      });
    return BusinessQuestionConfiguration.fromPrisma(data);
  }

  async createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
    formId: number,
  ): Promise<BusinessQuestionConfiguration> {
    console.log(questionId, key, settings, formId, 'serrign bussiness');
    const data = await this.prismaService.businessQuestionConfiguration.create({
      data: { questionId, key, settings, formId },
      include: { question: true },
    });
    return BusinessQuestionConfiguration.fromPrisma(data);
  }

  async getMaxQuestionIndex(formId: number): Promise<number> {
    const maxIndex = await this.prismaService.question.aggregate({
      where: { formId },
      _max: { index: true },
    });
    return maxIndex._max.index ?? 0;
  }

  async getSettingByQuestionType(
    questionType: QuestionType,
  ): Promise<QuestionConfiguration | null> {
    const data = await this.prismaService.questionConfiguration.findFirst({
      where: { key: questionType },
    });
    console.log(data, 'data');
    return QuestionConfiguration.fromPrisma(data);
  }

  async createDefaultQuestionConfigByAdmin(
    key: string,
    settings: any,
  ): Promise<SurveyFeedbackSettings> {
    const data = await this.prismaService.questionConfiguration.upsert({
      where: { key },
      update: { settings },
      create: { key, settings },
    });
    return SurveyFeedbackSettings.fromPrisma(data);
  }

  async createQuestion(
    formId: number,
    data: AddQuestionDto,
    sortOrder: number,
  ): Promise<Question> {
    const question = await this.prismaService.question.create({
      data: {
        headline: data.headline,
        questionType: data.questionType,
        index: sortOrder,
        formId: formId,
      },
      include: { form: true, answerOptions: true, questionOnMedia: true },
    });
    return Question.fromPrisma(question);
  }

  async getQuessionById(questionId: number): Promise<Question | null> {
    const data = await this.prismaService.question.findUnique({
      where: { id: questionId },
      include: { answerOptions: true },
    });
    console.log(data, '123456');
    return Question.fromPrisma(data);
  }

  async findAllQuestion(formId: number): Promise<Partial<Question>[]> {
    const data = await this.prismaService.question.findMany({
      where: { formId },
      include: {
        answerOptions: { include: { answerOptionOnMedia: true } },
        questionOnMedia: true,
      },
      orderBy: { index: 'asc' },
    });
    return data.map((question) => {
      return Question.fromPrisma(question);
    });
  }

  async uploadImagesAndSaveToDB(files: Express.Multer.File[]): Promise<void> {
    const uploadPromises = files.map((file) => this.uploadImage(file));
    await Promise.all(uploadPromises);
  }

  async uploadImage(image: Express.Multer.File): Promise<number> {
    const savedImage = await this.prismaService.media.create({
      data: {
        url: image.path,
        fileName: image.originalname,
        mimeType: image.mimetype,
        size: image.size,
      },
    });
    return savedImage.id;
  }

  async deleteQuestionById(questionId: number): Promise<void> {
    await this.prismaService.question.update({
      where: { id: questionId },
      data: { deletedAt: new Date() },
    });
  }

  async findQuestionBySortOrder(sortOrder: number): Promise<Question | null> {
    const data = await this.prismaService.question.findFirst({
      where: { index: sortOrder },
    });
    return Question.fromPrisma(data);
  }

  async updateIndexQuestion(questionId: number, index: number): Promise<void> {
    await this.prismaService.question.update({
      where: { id: questionId },
      data: { index },
    });
  }
}
