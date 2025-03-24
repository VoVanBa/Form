import { Injectable } from '@nestjs/common';
import { Prisma, QuestionConfiguration } from '@prisma/client';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { QuestionConfigurationDto } from '../dtos/question-configuration.dto';

@Injectable()
export class PrismaQuestionConfigurationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: QuestionConfigurationDto): Promise<QuestionConfiguration> {
    return await this.prisma.questionConfiguration.create({
      data,
    });
  }

  async findAll(formId: number): Promise<QuestionConfiguration[]> {
    return await this.prisma.questionConfiguration.findMany({
      where: {
        formId,
      },
    });
  }

  async findOne(id: number): Promise<QuestionConfiguration | null> {
    return await this.prisma.questionConfiguration.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    data: Prisma.QuestionConfigurationUpdateInput,
  ): Promise<QuestionConfiguration> {
    return await this.prisma.questionConfiguration.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<QuestionConfiguration> {
    return await this.prisma.questionConfiguration.delete({
      where: { id },
    });
  }
}
