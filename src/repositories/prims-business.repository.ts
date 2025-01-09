import { CreateBusinessDto } from 'src/business/dtos/business.dto';
import { PrismaService } from 'src/config/prisma.service';

export class PrismaBusinessRepository {
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
