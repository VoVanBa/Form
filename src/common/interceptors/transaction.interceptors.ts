import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { TRANSACTION_KEY } from '../decorater/transaction.decorator';
import { PrismaService } from 'src/config/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaTransactionManager } from '../prisma-transaction.manager';
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly transactionManager: PrismaTransactionManager,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const shouldUseTransaction = this.reflector.get<boolean>(
      TRANSACTION_KEY,
      context.getHandler(),
    );

    if (!shouldUseTransaction) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    return new Observable((subscriber) => {
      this.transactionManager
        .executeInTransaction(async (tx) => {
          request.transaction = tx; // Gắn tx vào request.transaction
          try {
            const result = await next.handle().toPromise();
            subscriber.next(result);
            subscriber.complete();
            return result;
          } catch (error) {
            subscriber.error(error);
            throw error; // Ném lỗi để rollback
          }
        })
        .catch((error) => {
          if (!subscriber.closed) {
            subscriber.error(error);
          }
        });
    });
  }
}
