import { PrismaBusinessRepository } from './../repositories/prims-business.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreateBusinessDto } from './dtos/business.dto';

@Injectable()
export class BusinessService {
  constructor(
    private prisma: PrismaService,
    private prismaBusinessRepository: PrismaBusinessRepository,
  ) {}
  async create(data: CreateBusinessDto, userId: number) {
    return this.prismaBusinessRepository.create(data, userId);
  }

  async deleteById(businessId: number) {
    return this.prismaBusinessRepository.deleteById(businessId);
  }
}
