import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreateBusinessDto } from './dtos/business.dto';

@Injectable()
export class BusinessService {
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
}
