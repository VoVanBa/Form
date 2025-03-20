import { Injectable } from '@nestjs/common';
import { CreateBusinessDto } from 'src/business/dtos/business.dto';
import { IBusinessRepository } from './interface/business.repository';
import { PrismaService } from 'src/helper/providers/prisma.service';
import { Business } from '../entities/Business';

@Injectable()
export class PrismaBusinessRepository implements IBusinessRepository {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateBusinessDto, userId: number) {
    return this.prisma.business.create({
      data: {
        name: data.name,
        address: data.address,
        userId: userId,
      },
    });
  }

  async deleteById(businessId: number) {
    return this.prisma.business.delete({
      where: {
        id: businessId,
      },
    });
  }

  async getbusinessbyId(businessId: number): Promise<Business> {
    const data = this.prisma.business.findFirst({
      where: {
        id: businessId,
      },
    });
    return new Business(data);
  }
}
