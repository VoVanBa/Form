import { Inject, Injectable } from '@nestjs/common';
import { AddQuestionDto } from '../question/dtos/add.question.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { PrismaService } from 'src/config/providers/prisma.service';
import { Question } from 'src/models/Question';
import { QuestionType } from 'src/models/enums/QuestionType';
import { BusinessQuestionConfiguration } from 'src/models/BusinessQuestionConfiguration';
import { SurveyFeedbackSettings } from 'src/models/SurveyFeedbackSettings';
import { QuestionRepository } from './i-repositories/question.repository';
import { QuestionConfiguration } from 'src/models/QuestionConfiguration';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async updateQuestion(
    questionId: number,
    data: UpdateQuestionDto,
    tx?: any,
  ): Promise<Question> {
    const prisma = tx || this.prismaService;
    const type = data.questionType as QuestionType;
    const updateQuestion = await prisma.question.update({
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
    tx?: any,
  ): Promise<BusinessQuestionConfiguration[]> {
    const prisma = tx || this.prismaService;
    const data = await prisma.businessQuestionConfiguration.findMany({
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
    tx?: any,
  ): Promise<SurveyFeedbackSettings> {
    const prisma = tx || this.prismaService;
    const setting = await prisma.businessQuestionConfiguration.update({
      where: { questionId, formId },
      data: { settings },
    });
    return SurveyFeedbackSettings.fromPrisma(setting);
  }

  async getBusinessQuestionConfigurationByQuestionId(
    questionId: number,
    formId: number,
    tx?: any,
  ): Promise<BusinessQuestionConfiguration | null> {
    const prisma = tx || this.prismaService;
    const data = await prisma.businessQuestionConfiguration.findUnique({
      where: { questionId, formId },
    });
    return BusinessQuestionConfiguration.fromPrisma(data);
  }

  async createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
    formId: number,
    tx?: any,
  ): Promise<BusinessQuestionConfiguration> {
    const prisma = tx || this.prismaService;
    const data = await prisma.businessQuestionConfiguration.create({
      data: { questionId, key, settings, formId },
      include: { question: true },
    });
    return BusinessQuestionConfiguration.fromPrisma(data);
  }

  async getMaxQuestionIndex(formId: number, tx?: any): Promise<number> {
    const prisma = tx || this.prismaService;
    const maxIndex = await prisma.question.aggregate({
      where: { formId: formId },
      _max: { index: true },
    });
    return maxIndex._max.index ?? 0;
  }

  async getSettingByQuestionType(
    questionType: QuestionType,
    tx?: any,
  ): Promise<QuestionConfiguration | null> {
    const prisma = tx || this.prismaService;
    const data = await prisma.questionConfiguration.findFirst({
      where: { key: questionType },
    });
    console.log(data, 'data');
    return QuestionConfiguration.fromPrisma(data);
  }

  async createDefaultQuestionConfigByAdmin(
    key: string,
    settings: any,
    tx?: any,
  ): Promise<SurveyFeedbackSettings> {
    const prisma = tx || this.prismaService;
    const data = await prisma.questionConfiguration.upsert({
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
    tx?: any,
  ): Promise<Question> {
    const prisma = tx || this.prismaService;
    const question = await prisma.question.create({
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

  async getQuessionById(
    questionId: number,
    tx?: any,
  ): Promise<Question | null> {
    const prisma = tx || this.prismaService;
    const data = await prisma.question.findUnique({
      where: { id: questionId },
      include: { answerOptions: true },
    });
    console.log(data, '123456');
    return Question.fromPrisma(data);
  }

  async findAllQuestion(
    formId: number,
    tx?: any,
  ): Promise<Partial<Question>[]> {
    const prisma = tx || this.prismaService;
    const data = await prisma.question.findMany({
      where: { formId },
      include: {
        answerOptions: { include: { answerOptionOnMedia: true } },
        questionOnMedia: true,
        businessQuestionConfiguration: true,
      },
      orderBy: { index: 'asc' },
    });
    return data.map((question) => {
      return Question.fromPrisma(question);
    });
  }

  async uploadImagesAndSaveToDB(
    files: Express.Multer.File[],
    tx?: any,
  ): Promise<void> {
    const prisma = tx || this.prismaService;
    const uploadPromises = files.map((file) => this.uploadImage(file, prisma));
    await Promise.all(uploadPromises);
  }

  async uploadImage(image: Express.Multer.File, tx?: any): Promise<number> {
    const prisma = tx || this.prismaService;
    const savedImage = await prisma.media.create({
      data: {
        url: image.path,
        fileName: image.originalname,
        mimeType: image.mimetype,
        size: image.size,
      },
    });
    return savedImage.id;
  }

  async deleteQuestionById(questionId: number, tx?: any): Promise<void> {
    const prisma = tx || this.prismaService;
    await prisma.question.update({
      where: { id: questionId },
      data: { deletedAt: new Date() },
    });
  }

  async findQuestionBySortOrder(
    sortOrder: number,
    tx?: any,
  ): Promise<Question | null> {
    const prisma = tx || this.prismaService;
    const data = await prisma.question.findFirst({
      where: { index: sortOrder },
    });
    return Question.fromPrisma(data);
  }

  async updateIndexQuestion(
    questionId: number,
    index: number,
    tx?: any,
  ): Promise<void> {
    const prisma = tx || this.prismaService;
    await prisma.question.update({
      where: { id: questionId },
      data: { index },
    });
  }

  async shiftIndexes(
    formId: number,
    fromIndex: number,
    toIndex: number,
    direction: 'up' | 'down',
    tx?: any,
  ) {
    const prisma = tx || this.prismaService;
    return await prisma.question.updateMany({
      where: {
        formId,
        index:
          direction === 'up'
            ? { gte: toIndex, lt: fromIndex } // Dời lên
            : { gt: fromIndex, lte: toIndex }, // Dời xuống
      },
      data: {
        index: direction === 'up' ? { increment: 1 } : { decrement: 1 },
      },
    });
  }

  async countQuestions(formId: number, tx?: any) {
    const prisma = tx || this.prismaService;
    return prisma.question.count({ where: { formId } });
  }

  async bulkUpdateIndexes(
    questions: { id: number; index: number }[],
    tx?: any,
  ) {
    const prisma = tx || this.prismaService;
    return Promise.all(
      questions.map(({ id, index }) =>
        prisma.question.update({
          where: { id },
          data: { index },
        }),
      ),
    );
  }
}
