import { FormStatus, FormTypes } from '@prisma/client';

export class UpdateFormDto {
  name?: string;
  description?: string;
  type?: FormTypes; // Use the enum type directly
  allowAnonymous?: boolean;
  status?: FormStatus; // Use the enum type directly
}
