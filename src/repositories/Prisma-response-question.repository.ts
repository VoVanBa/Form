import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreateResponseOnQuestionDto } from 'src/response-survey/dtos/create.response.on.question.dto';

@Injectable()
export class PrismaResponseQuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  // async create(data: CreateResponseOnQuestionDto, userResponseId: number) {
  //   return this.prisma.responseOnQuestion.create({
  //     data: {
  //       ...data,
  //       useronResponseId: userResponseId,
  //     },
  //   });
  // }
  async create(data: CreateResponseOnQuestionDto, userResponseId: number) {
    return this.prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId,
        question: {
          connect: { id: data.questionId },
        },
        answerOptionId: data.answerOptionId, // Đảm bảo nếu không có, sẽ là null
        answerText: data.answerText, // Đảm bảo nếu không có, sẽ là null
        ratingValue: data.ratingValue, // Đảm bảo nếu không có, sẽ là null
      },
    });
  }

  //   async findAll(): Promise<ResponseQuestion[]> {
  //     return this.prisma.responseQuestion.findMany();
  //   }

  //   async findOne(id: number): Promise<ResponseQuestion | null> {
  //     return this.prisma.responseQuestion.findUnique({
  //       where: { id },
  //     });
  //   }

  //   async update(
  //     id: number,
  //     data: Prisma.ResponseQuestionUpdateInput,
  //   ): Promise<ResponseQuestion> {
  //     return this.prisma.responseQuestion.update({
  //       where: { id },
  //       data,
  //     });
  //   }

  //   async remove(id: number): Promise<ResponseQuestion> {
  //     return this.prisma.responseQuestion.delete({
  //       where: { id },
  //     });
  //   }
}
