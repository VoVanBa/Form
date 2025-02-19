import { PrismaBusinessRepository } from './../repositories/prims-business.repository';
import { Injectable } from '@nestjs/common';
import { CreateBusinessDto } from './dtos/business.dto';

@Injectable()
export class BusinessService {
  constructor(private prismaBusinessRepository: PrismaBusinessRepository) {}
  async create(data: CreateBusinessDto, userId: number) {
    return await this.prismaBusinessRepository.create(data, userId);
  }

  async deleteById(businessId: number) {
    return await this.prismaBusinessRepository.deleteById(businessId);
  }

  async getAll(businessId: number) {
    return await this.prismaBusinessRepository.getbusinessbyId(businessId);
  }
}
