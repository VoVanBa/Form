import { Form } from '@prisma/client';
import { CreateFormDto } from 'src/forms/dtos/create.form.dto';
import { UpdateFormDto } from 'src/forms/dtos/update.form.dto';

export interface IFormRepository {
  createForm(data: CreateFormDto);
  getFormById(id: number);
  getAllForms(id: number);
  updateForm(id: number, data: UpdateFormDto);
  deleteForm(id: number);
}
