import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class PrismaUserResponseRepository {
  constructor(private readonly prisma: PrismaService) {}

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  async create(
    formId: number,
    guest: any,
    userId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    return prisma.userOnResponse.create({
      data: {
        formId,
        guest,
        userId,
      },
    });
  }

  // async create(formId: number, guest: any, userId: number) {
  //   return this.prisma.userOnResponse.create({
  //     data: {
  //       formId,
  //       guest,
  //       userId,
  //     },
  //   });
  // }

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

  async getAllDetailResponesFromUser(formId: number) {
    return this.prisma.userOnResponse.findMany({
      where: {
        formId: formId,
      },
      orderBy: {
        sentAt: 'desc',
      },
      include: {
        user: true,
        responseOnQuestions: {
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

  async getDetailResponsesByUsername(username: string, formId: number) {
    return this.prisma.userOnResponse.findMany({
      where: {
        formId: formId,
        user: {
          username: {
            contains: username,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      include: {
        user: true,
        responseOnQuestions: {
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
}
