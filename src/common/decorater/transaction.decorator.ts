// transaction.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ITransactionManager } from '../prisma-transaction.manager';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    @Inject('ITransactionManager')
    private readonly txManager: ITransactionManager,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    return new Observable((observer) => {
      this.txManager.startTransaction().then((tx) => {
        req.tx = tx;

        const prismaTx = tx.$transaction ? tx : this.txManager.getClient(); // Prisma-specific handling
        prismaTx
          .$transaction(async (prismaClient: any) => {
            req.tx = prismaClient; // Gán Prisma transaction client

            try {
              const result = await next.handle().toPromise();
              observer.next(result);
              observer.complete();
              await this.txManager.commitTransaction(prismaClient);
            } catch (error) {
              await this.txManager.rollbackTransaction(prismaClient);
              observer.error(error);
              throw error;
            }
          })
          .catch((err) => observer.error(err));
      });
    });
  }
}
