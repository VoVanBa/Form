import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaTransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  // Phương thức để thực thi các thao tác trong một giao dịch
  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  // Phương thức hỗ trợ giao dịch tương tác với tuỳ chọn
  async executeInteractiveTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: { maxWait?: number; timeout?: number },
  ): Promise<T> {
    return this.prisma.$transaction(callback, options);
  }

  // Phương thức tương thích với interceptor hiện tại của bạn
  // Trả về đối tượng hỗ trợ giao dịch
  async startTransaction(): Promise<Prisma.TransactionClient> {
    // Khởi tạo một đối tượng có thể sử dụng cho giao dịch
    // Lưu ý: Prisma không có API để chỉ "bắt đầu" giao dịch mà không thực thi nó
    // Đây là phương thức để duy trì tính tương thích API
    return this.prisma as unknown as Prisma.TransactionClient;
  }

  // Phương thức giả để duy trì tính tương thích API
  async commitTransaction(tx: Prisma.TransactionClient): Promise<void> {
    // Lưu ý: Trong Prisma, việc commit xảy ra tự động khi callback trả về thành công
    console.info(
      'Prisma commits automatically when the transaction callback completes successfully',
    );
  }

  // Phương thức giả để duy trì tính tương thích API
  async rollbackTransaction(tx: Prisma.TransactionClient): Promise<void> {
    // Lưu ý: Trong Prisma, việc rollback xảy ra tự động khi callback ném lỗi
    console.info(
      'Prisma rolls back automatically when the transaction callback throws an error',
    );
  }

  // Lấy Prisma client cơ bản
  getClient(): PrismaService {
    return this.prisma;
  }
}
