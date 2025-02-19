import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return new Observable((observer) => {
      this.prisma.$transaction(async (tx) => {
        context.switchToHttp().getRequest().prismaTx = tx; // Lưu transaction vào request
        next.handle().pipe(
          tap((data) => {
            observer.next(data); // Trả kết quả nếu thành công
            observer.complete();
          }),
          catchError((err) => {
            observer.error(err); // Nếu lỗi thì rollback
            throw err;
          }),
        ).subscribe();
      }).catch((err) => observer.error(err));
    });
  }
}
