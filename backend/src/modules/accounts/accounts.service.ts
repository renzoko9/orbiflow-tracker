import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { Account } from '@Entities';
import { AccountRepository } from '@Repositories';
import { CreateAccountRequest } from './dto/create-account.dto';
import { UpdateAccountRequest } from './dto/update-account.dto';
import { ErrorCodeEnum } from '@Enums';

@Injectable()
export class AccountsService {
  constructor(private readonly accountRepository: AccountRepository) {}

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
}
