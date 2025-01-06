import { Injectable } from '@nestjs/common';
import { CreateFormDto } from './dtos/create.form.dto';
import { UpdateFormDto } from './dtos/update.form.dto';
import { Form } from '@prisma/client';
import { IFormRepository } from 'src/repositories/i-repositories/form.repository';

@Injectable()
export class FormService {
  constructor(private readonly formRepository: IFormRepository) {}

  // async createForm(createFormDto: CreateFormDto): Promise<Form> {
  //   return this.formRepository.create(createFormDto);
  // }

  // async getForms(): Promise<Form[]> {
  //   return this.formRepository.findAll();
  // }

  // async getFormById(id: number): Promise<Form | null> {
  //   return this.formRepository.findOne(id);
  // }

  // async updateForm(id: number, updateFormDto: UpdateFormDto): Promise<Form> {
  //   return this.formRepository.update(id, updateFormDto);
  // }

  // async deleteForm(id: number): Promise<void> {
  //   return this.formRepository.remove(id);
  // }
}
