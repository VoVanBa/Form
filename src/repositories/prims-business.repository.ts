import { Injectable } from '@nestjs/common';
import { CreateBusinessDto } from 'src/business/dtos/business.dto';
import { IBusinessRepository } from './i-repositories/business.repository';
import { PrismaService } from 'src/config/prisma.service';
import { Business } from 'src/models/Business';

Injectable();
export class PrismaBusinessRepository implements IBusinessRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBusinessDto, userId: number): Promise<Business> {
    const business = await this.prisma.business.create({
      data: {
        name: data.name,
        address: data.address,
        userId: userId,
      },
    });
    return Business.fromPrisma(business);
  }

  async deleteById(businessId: number) {
    return await this.prisma.business.delete({
      where: {
        id: businessId,
      },
    });
  }

  async getbusinessbyId(businessId: number): Promise<Business> {
    const data = await this.prisma.business.findFirst({
      where: {
        id: businessId,
      },
    });
    return Business.fromPrisma(data);
  }
}
