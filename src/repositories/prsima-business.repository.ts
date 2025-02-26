import { Injectable } from '@nestjs/common';
import { CreateBusinessDto } from 'src/business/dtos/business.dto';
import { IBusinessRepository } from './i-repositories/business.repository';
import { PrismaService } from 'src/config/prisma.service';
import { Business } from 'src/models/Business';
import { name } from 'ejs';

@Injectable()
export class PrismaBusinessRepository implements IBusinessRepository {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateBusinessDto, userId: number, tx?: any) {
    const prisma = tx || this.prisma;
    return prisma.business.create({
      data: {
        name: data.name,
        address: data.address,
        userId: userId,
      },
    });
  }

  async deleteById(businessId: number, tx?: any) {
    const prisma = tx || this.prisma;
    return prisma.business.delete({
      where: {
        id: businessId,
      },
    });
  }

  async getbusinessbyId(businessId: number, tx?: any) {
    const prisma = tx || this.prisma;
    return prisma.business.findFirst({
      where: {
        id: businessId,
      },
    });
  }
}
