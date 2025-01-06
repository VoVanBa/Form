import { Injectable } from '@nestjs/common';
import { Form } from '@prisma/client';
import { PrismaService } from 'src/config/prisma.service';
import { CreateFormDto } from 'src/forms/dtos/create.form.dto';
import { UpdateFormDto } from 'src/forms/dtos/update.form.dto';
import { IFormRepository } from './i-repositories/form.repository';

@Injectable()
export class PrismaFormRepository implements IFormRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createForm(data: CreateFormDto): Promise<Form> {
    return this.prisma.form.create({
      data,
    });
  }
  async getFormById(id: number): Promise<Form | null> {
    return this.prisma.form.findUnique({
      where: { id },
    });
  }
  async getAllForms(businessId: number): Promise<Form[]> {
    return this.prisma.form.findMany({
      where: {
        businessId,
      },
    });
  }
  async updateForm(id: number, data: UpdateFormDto): Promise<Form> {
    return this.prisma.form.update({
      where: { id },
      data,
    });
  }
  async deleteForm(id: number): Promise<Form> {
    return this.prisma.form.delete({
      where: { id },
    });
  }
}
