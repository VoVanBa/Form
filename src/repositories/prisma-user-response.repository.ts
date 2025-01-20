import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class PrismaUserResponseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(formId: number, guest: any, userId: number) {
    return this.prisma.userOnResponse.create({
      data: {
        formId,
        guest,
        userId,
      },
    });
  }

  async findAllByFormId(formId: number) {
    return this.prisma.userOnResponse.findMany({
      where: {
        formId,
      },
    });
  }

  async getUserResponse(formId: number) {
    return this.prisma.userOnResponse.findMany({
      where: {
        formId: formId,
      },
    });
  }

  async getDetailResponesFromUser(formId: number) {
    return this.prisma.userOnResponse.findMany({
      where: {
        formId: formId,
      },
      orderBy: {
        sentAt: 'desc', // Sorting the parent model `userOnResponse` by `sentAt`
      },
      include: {
        user: true,
        responseOnQuestions: {
          // orderBy: { sentAt: 'desc' },
          include: {
            question: {
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
            },
          },
        },
      },
    });
  }

  // async getDetailResponesFromUser(formId: number) {
  //   return this.prisma.question.findMany({
  //     where: {
  //       formId: formId,
  //     },
  //     include: {
  //       responseOnQuestions: {
  //         include: {
  //           userResponse: {
  //             include: {
  //               user: true,
  //             },
  //           },
  //           answerOption: {
  //             include: {
  //               answerOptionOnMedia: {
  //                 include: {
  //                   media: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }
}
