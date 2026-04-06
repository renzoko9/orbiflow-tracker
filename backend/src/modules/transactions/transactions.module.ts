import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionRepository } from '@Repositories';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '@Entities';
import { AccountsModule } from '../accounts/accounts.module';
import { TransactionsMapper } from './transactions.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), AccountsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository, TransactionsMapper],
  exports: [TransactionsService, TransactionRepository],
})
export class TransactionsModule {}
