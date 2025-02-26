import { PrismaBusinessRepository } from '../repositories/prsima-business.repository';
import { Injectable } from '@nestjs/common';
import { CreateBusinessDto } from './dtos/business.dto';

@Injectable()
export class BusinessService {
  constructor(private prismaBusinessRepository: PrismaBusinessRepository) {}
  async create(data: CreateBusinessDto, userId: number, tx?: any) {
    return this.prismaBusinessRepository.create(data, userId, tx);
  }

  async deleteById(id: number, tx?: any) {
    return this.prismaBusinessRepository.deleteById(id, tx);
  }

  async getbusinessbyId(businessId: number, tx?: any) {
    return this.prismaBusinessRepository.getbusinessbyId(businessId, tx);
  }
}
