import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionRepository } from 'src/database/repositories/transaction.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/database/entities/transaction.entity';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), AccountsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository],
  exports: [TransactionsService, TransactionRepository],
})
export class TransactionsModule {}
