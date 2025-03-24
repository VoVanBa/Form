import { Inject, Injectable } from '@nestjs/common';
import { AddQuestionDto } from '../dtos/add.question.dto';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { Question } from 'src/question/entities/Question';
import { QuestionType } from 'src/question/entities/enums/QuestionType';
import { SurveyFeedbackSettings } from 'src/settings/entities/SurveyFeedbackSettings';
import { QuestionRepository } from './interface/question.repository';
import { QuestionConfiguration } from 'src/settings/entities/QuestionConfiguration';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateQuestion(
    questionId: number,
    data: UpdateQuestionDto,
  ): Promise<Question> {
    const type = data.questionType as QuestionType;
    const updateQuestion = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        headline: data.headline,
        questionType: type,
        questionConfiguration: data.settings
          ? {
              update: {
                settings: data.settings,
              },
            }
          : undefined,
      },
    });
    return new Question(updateQuestion);
  }

  async bulkUpdateQuestions(
    updates: { id: number; data: Partial<UpdateQuestionDto> }[],
  ): Promise<number> {
    const results = await Promise.all(
      updates.map(({ id, data }) =>
        this.prisma.question.updateMany({
          where: { id },
          data: {
            headline: data.headline,
            questionType: data.questionType as QuestionType,
          },
        }),
      ),
    );
    return results.reduce((acc, result) => acc + result.count, 0);
  }

  async getSettingByFormId(formId: number): Promise<QuestionConfiguration[]> {
    const data = await this.prisma.questionConfiguration.findMany({
      where: {
        formId: formId,
      },
    });

    return data.map((setting) => new QuestionConfiguration(setting));
  }

  async getSettingByQuestionId(
    questionId: number,
  ): Promise<QuestionConfiguration> {
    const data = await this.prisma.question.findFirst({
      where: {
        id: questionId,
      },
      include: { questionConfiguration: true },
    });
    return new QuestionConfiguration(data);
  }

  async updateQuestionSetting(
    questionId: number,
    settings: any,
    formId: number,
  ): Promise<SurveyFeedbackSettings> {
    const setting = await this.prisma.questionConfiguration.update({
      where: { questionId, formId },
      data: { settings },
    });
    return new SurveyFeedbackSettings(setting);
  }

  async bulkUpdateQuestionSettings(
    updates: { questionId: number; settings: any; formId: number }[],
  ): Promise<number> {
    // Chạy tất cả update song song bằng Promise.all()
    const results = await Promise.all(
      updates.map(({ questionId, settings, formId }) =>
        this.prisma.questionConfiguration.updateMany({
          where: { questionId, formId },
          data: { settings },
        }),
      ),
    );

    // Tính tổng số bản ghi được cập nhật
    return results.reduce((total, result) => total + result.count, 0);
  }

  async getQuestionConfigurationByQuestionId(
    questionId: number,
    formId: number,
  ): Promise<QuestionConfiguration | null> {
    const data = await this.prisma.questionConfiguration.findUnique({
      where: { questionId, formId },
    });
    return new QuestionConfiguration(data);
  }

  async createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
    formId: number,
  ): Promise<QuestionConfiguration> {
    const data = await this.prisma.questionConfiguration.create({
      data: { questionId, key, settings, formId },
      include: { question: true },
    });
    return new QuestionConfiguration(data);
  }

  async bulkCreateQuestionSettings(
    settings: {
      questionId: number;
      settings: any;
      key: string;
      formId: number;
    }[],
  ): Promise<number> {
    const createdSettings = await this.prisma.questionConfiguration.createMany({
      data: settings.map((setting) => ({
        questionId: setting.questionId,
        key: setting.key,
        settings: setting.settings,
        formId: setting.formId,
      })),
    });
    return createdSettings.count;
  }

  async getMaxQuestionIndex(formId: number): Promise<number> {
    const maxIndex = await this.prisma.question.aggregate({
      where: { formId: formId },
      _max: { index: true },
    });
    return maxIndex._max.index ?? 0;
  }

  async getSettingByQuestionType(
    questionType: QuestionType,
  ): Promise<QuestionConfiguration | null> {
    const data = await this.prisma.questionConfiguration.findFirst({
      where: { key: questionType },
    });
    console.log(data, 'data');
    return new QuestionConfiguration(data);
  }

  async createQuestion(
    formId: number,
    data: AddQuestionDto,
    sortOrder: number,
  ): Promise<Question> {
    const question = await this.prisma.question.create({
      data: {
        headline: data.headline,
        questionType: data.questionType,
        index: sortOrder,
        form: {
          connect: { id: formId },
        },
        questionConfiguration: data.settings
          ? {
              create: {
                formId,
                key: data.questionType,
                settings: data.settings,
              },
            }
          : undefined,
        questionOnMedia: data.imageId
          ? {
              create: {
                mediaId: data.imageId,
              },
            }
          : undefined,
      },

      include: { form: true, answerOptions: true, questionOnMedia: true },
    });
    return new Question(question);
  }

  async bulkCreateQuestions(
    formId: number,
    questions: { data: AddQuestionDto; sortOrder: number }[],
  ): Promise<number> {
    const createdQuestions = await this.prisma.question.createMany({
      data: questions.map(({ data, sortOrder }) => ({
        headline: data.headline,
        questionType: data.questionType,
        index: sortOrder,
        formId: formId,
        questionConfiguration: data.settings
          ? {
              create: {
                formId,
                key: data.questionType,
                settings: data.settings,
              },
            }
          : undefined,
        questionOnMedia: data.imageId
          ? {
              create: {
                mediaId: data.imageId,
              },
            }
          : undefined,
        answerOptions: data.answerOptions
          ? {
              create: data.answerOptions.map((answerOption) => ({
                headline: answerOption.label,
                answerOptionOnMedia: answerOption.imageIds
                  ? {
                      create: {
                        mediaId: answerOption.imageIds,
                      },
                    }
                  : undefined,
              })),
            }
          : undefined,
      })),
    });
    return createdQuestions.count;
  }

  async getQuessionById(questionId: number): Promise<Question | null> {
    const data = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        answerOptions: {
          include: {
            answerOptionOnMedia: {
              include: {
                media: true,
              },
            },
          },
        },
      },
    });
    console.log(data, '123456');
    return new Question(data);
  }

  // async findAllQuestion(formId: number): Promise<Question[]> {
  //   const data = await this.prisma.question.findMany({
  //     where: { formId, deletedAt: null },
  //     include: {
  //       answerOptions: {
  //         include: {
  //           answerOptionOnMedia: {
  //             include: {
  //               media: true,
  //             },
  //           },
  //         },
  //       },
  //       questionOnMedia: true,
  //       QuestionConfiguration: true,
  //     },
  //     orderBy: { index: 'asc' },
  //   });
  //   return data.map((question) => {
  //     return new Question(question);
  //   });
  // }

  async findAllQuestion(
    formId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Question[]> {
    let filter: any = { formId };

    if (startDate && endDate) {
      filter.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    const questions = await this.prisma.question.findMany({
      where: { ...filter, deletedAt: null },
      include: {
        questionOnMedia: {
          include: {
            media: true,
          },
        },
        answerOptions: {
          include: {
            answerOptionOnMedia: {
              include: {
                media: true,
              },
            },
          },
        },
        responseOnQuestions: true,
        questionConfiguration: {
          select: {
            settings: true,
          },
        },
      },
      orderBy: { index: 'asc' },
    });
    return questions.map((question) => {
      return new Question(question);
    });
  }

  async uploadImagesAndSaveToDB(files: Express.Multer.File[]): Promise<void> {
    const uploadPromises = files.map((file) => this.uploadImage(file));
    await Promise.all(uploadPromises);
  }

  async uploadImage(image: Express.Multer.File): Promise<number> {
    const savedImage = await this.prisma.media.create({
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
    await this.prisma.question.update({
      where: { id: questionId },
      data: { deletedAt: new Date() },
    });
  }

  async findQuestionBySortOrder(sortOrder: number): Promise<Question | null> {
    const data = await this.prisma.question.findFirst({
      where: { index: sortOrder },
    });
    return new Question(data);
  }

  async updateIndexQuestion(questionId: number, index: number): Promise<void> {
    await this.prisma.question.update({
      where: { id: questionId },
      data: { index },
    });
  }
  // async bulkUpdateIndexes(
  //   questions: { id: number; index: number }[],
  // ): Promise<number> {
  //   const results = await Promise.all(
  //     questions.map(({ id, index }) =>
  //       this.prisma.question.updateMany({
  //         where: { id },
  //         data: { index },
  //       }),
  //     ),
  //   );
  //   return results.reduce((acc, result) => acc + result.count, 0);
  // }

  async shiftIndexes(
    formId: number,
    fromIndex: number,
    toIndex: number,
    direction: 'up' | 'down',
  ) {
    return await this.prisma.question.updateMany({
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

  async countQuestions(formId: number) {
    return this.prisma.question.count({ where: { formId } });
  }

  async bulkUpdateIndexes(questions: { id: number; index: number }[]) {
    return Promise.all(
      questions.map(({ id, index }) =>
        this.prisma.question.update({
          where: { id },
          data: { index },
        }),
      ),
    );
  }

  async getIndexQuestionById(formId: number, index: number) {
    return await this.prisma.question.findFirst({
      where: {
        formId,
        index: index,
        deletedAt: null,
      },
    });
  }

  async getAllQuestionsFromIndex(
    formId: number,
    startIndex: number,
  ): Promise<Partial<Question>[]> {
    const data = await this.prisma.question.findMany({
      where: {
        formId,
        index: {
          gte: startIndex,
        },
      },
      orderBy: { index: 'asc' },
    });
    return data.map((question) => {
      return new Question(question);
    });
  }

  async bulkDeleteQuestions(ids: number[]): Promise<number> {
    const result = await this.prisma.question.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
    return result.count;
  }
}
