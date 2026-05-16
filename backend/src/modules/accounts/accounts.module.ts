import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountRepository, TransactionRepository } from '@Repositories';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Transaction } from '@Entities';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Transaction])],
  controllers: [AccountsController],
  providers: [AccountsService, AccountRepository, TransactionRepository],
  exports: [AccountsService, AccountRepository],
})
export class AccountsModule {}
