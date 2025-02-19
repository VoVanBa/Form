import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { TransactionInterceptor } from '../interceptors/transaction.interceptors';

export function Transaction() {
  return applyDecorators(UseInterceptors(TransactionInterceptor));
}
