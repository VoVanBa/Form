import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export const TRANSACTION_KEY = 'transaction';
export const UseTransaction = () => SetMetadata(TRANSACTION_KEY, true);
