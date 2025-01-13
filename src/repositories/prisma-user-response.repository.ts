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
}
