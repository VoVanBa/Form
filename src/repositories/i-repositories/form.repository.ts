import { Form } from '@prisma/client';
import { CreateFormDto } from 'src/forms/dtos/create.form.dto';
import { UpdateFormDto } from 'src/forms/dtos/update.form.dto';

export interface IFormRepository {
  createForm(data: CreateFormDto): Promise<Form>;
  getFormById(id: number): Promise<Form | null>;
  getAllForms(id: number): Promise<Form[]>;
  updateForm(id: number, data: UpdateFormDto): Promise<Form>;
  deleteForm(id: number): Promise<Form>;
}
