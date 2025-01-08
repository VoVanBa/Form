// src/modules/repositories/prisma-question.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
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

  async updateQuestionSetting(questionId: number, settings: any): Promise<any> {
    return this.prismaService.businessQuestionConfiguration.update({
      where: { questionId: questionId },
      data: {
        settings: settings,
      },
    });
  }

  async getBusinessQuestionConfigurationByQuestionId(questionId: number) {
    return this.prismaService.businessQuestionConfiguration.findUnique({
      where: { questionId: questionId },
    });
  }

  async createQuestionSettings(
    questionId: number,
    settings: any,
    key: string,
  ): Promise<any> {
    const businessConfig =
      await this.prismaService.businessQuestionConfiguration.create({
        data: {
          questionId: questionId,
          key: key,
          settings: settings,
        },
        include: {
          question: true,
        },
      });

    return businessConfig;
  }

  async getQuestionCountInForm(formId: number): Promise<number> {
    const count = await this.prismaService.question.count({
      where: { formId: formId },
    });
    return count;
  }

  async getSettingByQuestionType(questionType: QuestionType): Promise<any> {
    return this.prismaService.questionConfiguration.findFirst({
      where: { key: questionType },
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
        settings: true,
        form: true,
      },
    });

    return question;
  }

  getQuessionById(questionId: number): Promise<any> {
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
    await this.prismaService.question.delete({
      where: { id: questionId },
    });
  }

  async handleQuestionOrderUp(questionId: number): Promise<any> {}

  async handleQuestionOrderDown(questionId: number): Promise<any> {}
}
