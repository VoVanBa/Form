// transaction-manager.interface.ts
export interface ITransactionManager {
  startTransaction(): Promise<any>;
  commitTransaction(tx: any): Promise<void>;
  rollbackTransaction(tx: any): Promise<void>;
  getClient(): any;
}

// prisma-transaction.manager.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class PrismaTransactionManager implements ITransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async startTransaction() {
    return this.prisma; // Prisma transaction sẽ được xử lý trong interceptor
  }

  async commitTransaction(tx: any) {
    // Prisma tự commit
  }

  async rollbackTransaction(tx: any) {
    // Prisma tự rollback khi lỗi
  }

  getClient() {
    return this.prisma;
  }
}
