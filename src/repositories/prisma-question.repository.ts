import { PrismaService } from './../config/prisma.service';
// src/modules/repositories/prisma-question.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { AddQuestionDto } from '../question/dtos/add.question.dto';
import { QuestionRepository } from './i-repositories/question.repository';
import { Question, QuestionType } from '@prisma/client';
import { UpdateQuestionDto } from 'src/question/dtos/update.question.dto';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async updateQuestion(
    questionId: number,
    data: UpdateQuestionDto,
  ): Promise<any> {
    return this.prismaService.question.update({
      where: { id: questionId },
      data: {
        headline: data.headline,
        questionType: data.questionType,
      },
    });
  }

  async updateQuestionSetting(
    questionId: number,
    settings: any,
    formId: number,
  ): Promise<any> {
    return this.prismaService.businessQuestionConfiguration.update({
      where: {
        questionId_formId: {
          questionId: questionId,
          formId: formId,
        },
      },
      data: {
        settings: settings,
      },
    });
  }

  async getBusinessQuestionConfigurationByQuestionId(
    questionId: number,
    formId: number,
  ) {
    return this.prismaService.businessQuestionConfiguration.findUnique({
      where: {
        questionId_formId: {
          questionId: questionId,
          formId: formId,
        },
      },
    });
  }

  async createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
    formId: number,
  ): Promise<any> {
    const businessConfig =
      await this.prismaService.businessQuestionConfiguration.create({
        data: {
          questionId: questionId,
          key: key,
          settings: settings,
          formId: formId,
        },
        include: {
          question: true,
        },
      });

    return businessConfig;
  }

  async getMaxQuestionIndex(formId: number) {
    const maxIndex = await this.prismaService.question.aggregate({
      where: { formId },
      _max: { index: true },
    });
    const newIndex = (maxIndex._max.index ?? 0) + 1;
    return newIndex;
  }

  async getSettingByQuestionType(questionType: QuestionType): Promise<any> {
    return this.prismaService.questionConfiguration.findFirst({
      where: { key: questionType },
    });
  }

  async getSettingByFormId(formId: number): Promise<any> {
    return this.prismaService.businessQuestionConfiguration.findMany({
      where: {
        formId: formId,
      },
    });
  }

  async createDefaultQuestionConfigByAdmin(
    key: any,
    settings: any,
  ): Promise<any> {
    return this.prismaService.questionConfiguration.upsert({
      where: { key },
      update: { settings },
      create: { key, settings },
    });
  }

  async createQuestion(
    formId: number,
    data: AddQuestionDto,
    // settingId: number,
    sortOrder: number,
  ): Promise<any> {
    const question = await this.prismaService.question.create({
      data: {
        headline: data.headline,
        questionType: data.questionType,
        index: sortOrder,
        formId: formId,
        // businessQuestionConfigurationId: settingId,
      },
      include: {
        // settings: true,
        form: true,
      },
    });

    return question;
  }

  getQuessionById(questionId: number) {
    return this.prismaService.question.findUnique({
      where: { id: questionId },
    });
  }
  async findAllQuestion(formId: number) {
    return await this.prismaService.question.findMany({
      where: { formId },
      select: {
        id: true,
        headline: true,
        questionType: true,
        index: true,
        answerOptions: {
          include: {
            answerOptionOnMedia: true,
          },
        },
        questionOnMedia: true,
      },
      orderBy: { index: 'asc' },
    });
  }
  async uploadImagesAndSaveToDB(files: Express.Multer.File[]): Promise<any> {
    const uploadPromises = files.map((file) => this.uploadImage(file));
    return await Promise.all(uploadPromises);
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
      data: { isDeleted: true },
    });
  }

  async findQuestionBySortOrder(sortOrder: number) {
    return await this.prismaService.question.findFirst({
      where: {
        index: sortOrder,
      },
    });
  }

  async updateIndexQuestion(questionId: number, index: number) {
    const currQuestion = await this.prismaService.question.update({
      where: {
        id: questionId,
      },
      data: {
        index: index,
      },
    });
  }
}
