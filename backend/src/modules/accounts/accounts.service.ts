import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { Account } from '@Entities';
import { AccountRepository, TransactionRepository } from '@Repositories';
import { CreateAccountRequest } from './dto/create-account.dto';
import { UpdateAccountRequest } from './dto/update-account.dto';
import { AccountMonthStatsResponse } from './models/account-month-stats-response.model';
import { CategoryTypeEnum, ErrorCodeEnum } from '@Enums';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async create(
    userId: number,
    createAccountDto: CreateAccountRequest,
  ): Promise<Account> {
    const newAccount = this.accountRepository.create({
      ...createAccountDto,
      user: { id: userId },
      balance: createAccountDto.balance || 0,
    });
    return this.accountRepository.save(newAccount);
  }

  async findAll(userId: number): Promise<Account[]> {
    return this.accountRepository.find({
      where: { user: { id: userId }, archivedAt: IsNull() },
    });
  }

  async findArchived(userId: number): Promise<Account[]> {
    return this.accountRepository.find({
      where: { user: { id: userId }, archivedAt: Not(IsNull()) },
    });
  }

  async findOne(id: number, userId: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!account) {
      throw new NotFoundException({
        message: `Account with id ${id} not found`,
        errorCode: ErrorCodeEnum.ACCOUNT_NOT_FOUND,
      });
    }

    return account;
  }

  async update(
    id: number,
    userId: number,
    updateAccountDto: UpdateAccountRequest,
  ): Promise<Account> {
    const account = await this.findOne(id, userId);
    Object.assign(account, updateAccountDto);
    return this.accountRepository.save(account);
  }

  async archive(id: number, userId: number): Promise<Account> {
    const account = await this.findOne(id, userId);

    if (account.archivedAt !== null) {
      return account;
    }

    account.archivedAt = new Date();
    return this.accountRepository.save(account);
  }

  async restore(id: number, userId: number): Promise<Account> {
    const account = await this.findOne(id, userId);

    if (account.archivedAt === null) {
      return account;
    }

    account.archivedAt = null;
    return this.accountRepository.save(account);
  }

  async getMonthStats(
    id: number,
    userId: number,
  ): Promise<AccountMonthStatsResponse> {
    await this.findOne(id, userId);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const monthStart = this.formatDate(startDate);
    const monthEnd = this.formatDate(endDate);

    const rows = await this.transactionRepository
      .createQueryBuilder('tx')
      .select('tx.type', 'type')
      .addSelect('SUM(tx.amount)', 'total')
      .where('tx.account_id = :id', { id })
      .andWhere('tx.user_id = :userId', { userId })
      .andWhere('tx.date >= :start', { start: monthStart })
      .andWhere('tx.date <= :end', { end: monthEnd })
      .groupBy('tx.type')
      .getRawMany<{ type: number; total: string }>();

    let income = 0;
    let expenses = 0;
    for (const row of rows) {
      const total = Number(row.total);
      if (Number(row.type) === CategoryTypeEnum.Income) income = total;
      else if (Number(row.type) === CategoryTypeEnum.Expense) expenses = total;
    }

    return { income, expenses, monthStart, monthEnd };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
