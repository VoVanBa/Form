import { FormStatus, FormTypes } from '@prisma/client';

export class CreateFormDto {
  name: string;
  description?: string;
  createdBy: string;
  type: FormTypes; // Tạo Enum nếu cần
  allowAnonymous: boolean;
  status: FormStatus; // Tạo Enum nếu cần
  businessId: number;
}
