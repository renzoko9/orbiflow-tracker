import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TransactionsService } from './transactions.service';
import { CreateTransactionRequest } from './dto/create-transaction.dto';
import { UpdateTransactionRequest } from './dto/update-transaction.dto';
import { CreateTransferRequest } from './dto/create-transfer.dto';
import { UpdateTransferRequest } from './dto/update-transfer.dto';
import { FilterTransactionsQuery } from './dto/filter-transactions.dto';
import { JwtAccessGuard } from '@/common/jwt/access-token/jwt-access.guard';
import { User } from '@/common/decorators/user.decorator';
import { ResponseAPI } from '@/common/interfaces/response.interface';
import {
  AccountMovementListResponse,
  TransactionDetailResponse,
  TransactionListResponse,
  TransactionResponse,
  TransferDetailResponse,
} from './models/transaction-response.model';

@Controller('transactions')
@UseGuards(JwtAccessGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @User('id') userId: number,
    @Body() createTransactionRequest: CreateTransactionRequest,
  ): Promise<ResponseAPI<TransactionResponse>> {
    return this.transactionsService.create(userId, createTransactionRequest);
  }

  @Post('transfer')
  createTransfer(
    @User('id') userId: number,
    @Body() body: CreateTransferRequest,
  ): Promise<ResponseAPI<TransferDetailResponse>> {
    return this.transactionsService.createTransfer(userId, body);
  }

  @Get()
  @Throttle({ default: { ttl: 60000, limit: 60 } })
  findAll(
    @User('id') userId: number,
    @Query() filters: FilterTransactionsQuery,
  ): Promise<TransactionListResponse[]> {
    return this.transactionsService.findAll(userId, filters);
  }

  @Get('account/:accountId')
  findByAccount(
    @Param('accountId') accountId: number,
    @User('id') userId: number,
  ): Promise<AccountMovementListResponse[]> {
    return this.transactionsService.findByAccount(accountId, userId);
  }

  @Get('transfer/:groupId')
  findTransfer(
    @Param('groupId') groupId: string,
    @User('id') userId: number,
  ): Promise<TransferDetailResponse> {
    return this.transactionsService.findTransferByGroupId(groupId, userId);
  }

  @Patch('transfer/:groupId')
  updateTransfer(
    @Param('groupId') groupId: string,
    @User('id') userId: number,
    @Body() body: UpdateTransferRequest,
  ): Promise<ResponseAPI<TransferDetailResponse>> {
    return this.transactionsService.updateTransfer(userId, groupId, body);
  }

  @Delete('transfer/:groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTransfer(
    @Param('groupId') groupId: string,
    @User('id') userId: number,
  ): Promise<void> {
    return this.transactionsService.deleteTransfer(userId, groupId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: number,
    @User('id') userId: number,
  ): Promise<TransactionDetailResponse> {
    return this.transactionsService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @User('id') userId: number,
    @Body() updateTransactionRequest: UpdateTransactionRequest,
  ): Promise<ResponseAPI<TransactionResponse>> {
    return this.transactionsService.update(
      id,
      userId,
      updateTransactionRequest,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number, @User('id') userId: number): Promise<void> {
    return this.transactionsService.delete(id, userId);
  }
}
