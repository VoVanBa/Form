// transaction-param.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Transaction = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.transaction;
  },
);
