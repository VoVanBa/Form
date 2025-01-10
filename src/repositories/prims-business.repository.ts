import { Injectable } from '@nestjs/common';
import { CreateBusinessDto } from 'src/business/dtos/business.dto';
import { PrismaService } from 'src/config/prisma.service';
import { IBusinessRepository } from './i-repositories/business.repository';

@Injectable()
export class PrismaBusinessRepository implements IBusinessRepository {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateBusinessDto, userId: number) {
    console.log('Received data:', data);
    console.log('User ID:', userId);
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

  async getbusinessbyId(businessId:number){
    return this.prisma.business.findFirst({
      where:{
        id:businessId
      }
    })
  }
}
