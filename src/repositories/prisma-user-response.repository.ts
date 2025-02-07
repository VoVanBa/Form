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

  async getAllDetailResponesFromUser(formId: number, cursor?: number, limit: number = 10) {
    const data = await this.prisma.userOnResponse.findMany({
      where: { formId },
      orderBy: { sentAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: true,
        responseOnQuestions: {
          include: {
            question: {
              include: {
                answerOptions: {
                  include: { answerOptionOnMedia: { include: { media: true } } },
                },
              },
            },
          },
        },
      },
    });
  
    return {
      data,
      nextCursor: data.length === limit ? data[data.length - 1].id : null,
    };
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
