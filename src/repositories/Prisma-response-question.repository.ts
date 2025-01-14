import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreateResponseOnQuestionDto } from 'src/response-survey/dtos/create.response.on.question.dto';
import { ResponseDto } from 'src/response-survey/dtos/response.dto';

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
  async create(
    questionId: number,
    answerOptionId: number,
    userResponseId: number,
    answerText: string,
    ratingValue: number,
    formId: number,
  ) {
    return this.prisma.responseOnQuestion.create({
      data: {
        useronResponseId: userResponseId, // Chắc chắn kiểu là number
        questionId: questionId, // Chắc chắn kiểu là number
        answerOptionId: answerOptionId, // Chắc chắn kiểu là number[] hoặc null
        answerText: answerText, // Chắc chắn kiểu là string hoặc null
        ratingValue: ratingValue, // Chắc chắn kiểu là number hoặc null
        formId,
      },
    });
  }

  // async createResponseOnQuestion(
  //   data: CreateResponseOnQuestionDto,
  //   userResponseId: number,
  //   questionId: number,
  // ) {
  //   // Chuyển đổi CreateResponseOnQuestionDto thành đối tượng cần lưu trữ
  //   const responseData = data.responses.map(response => ({
  //     useronResponseId: userResponseId,
  //     questionId,
  //     answerOptionId: response.answerOptionId,
  //     answerText: response.answerText,
  //     ratingValue: response.ratingValue,
  //   }));

  //   // Lưu nhiều bản ghi câu trả lời cùng lúc
  //   return this.prisma.responseOnQuestion.createMany({
  //     data: responseData,
  //   });
  // }

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
