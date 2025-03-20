import { PrismaBusinessRepository } from './repositories/prsima-business.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBusinessDto } from './dtos/business.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class BusinessService {
  constructor(
    private prismaBusinessRepository: PrismaBusinessRepository,
    private readonly i18n: I18nService,
  ) {}
  async create(data: CreateBusinessDto, userId: number) {
    return this.prismaBusinessRepository.create(data, userId);
  }

  async deleteById(id: number) {
    return this.prismaBusinessRepository.deleteById(id);
  }

  async getbusinessbyId(businessId: number) {
    return this.prismaBusinessRepository.getbusinessbyId(businessId);
  }

  async validateBusiness(id: number) {
    const business = await this.prismaBusinessRepository.getbusinessbyId(id);

    if (!business) {
      throw new NotFoundException(
        this.i18n.translate('errors.BUSINESSNOTFOUND'),
      );
    }
    return business;
  }
}
