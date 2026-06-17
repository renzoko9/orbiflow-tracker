import {
  BadRequestException,
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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Throttle } from '@nestjs/throttler';
import { TransactionsService } from './transactions.service';
import { StorageService } from '@/common/providers/storage/storage.service';
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

const MAX_PHOTOS_PER_TRANSACTION = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const photoFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
): void => {
  if (ALLOWED_PHOTO_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException({
        message: 'Formato no soportado. Usa JPG, PNG o WEBP.',
      }),
      false,
    );
  }
};

const photosInterceptor = FilesInterceptor(
  'photos',
  MAX_PHOTOS_PER_TRANSACTION,
  {
    storage: memoryStorage(),
    limits: { fileSize: MAX_PHOTO_SIZE },
    fileFilter: photoFileFilter,
  },
);

@Controller('transactions')
@UseGuards(JwtAccessGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly storage: StorageService,
  ) {}

  private async uploadPhotos(
    files: Express.Multer.File[] | undefined,
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    return Promise.all(
      files.map(async (file) => {
        const key = this.storage.buildKey('transactions', file.originalname);
        await this.storage.upload(key, file.buffer, file.mimetype);
        return key;
      }),
    );
  }

  @Post()
  @UseInterceptors(photosInterceptor)
  async create(
    @User('id') userId: number,
    @Body() createTransactionRequest: CreateTransactionRequest,
    @UploadedFiles() photos?: Express.Multer.File[],
  ): Promise<ResponseAPI<TransactionResponse>> {
    return this.transactionsService.create(userId, {
      ...createTransactionRequest,
      photos: await this.uploadPhotos(photos),
    });
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
  @UseInterceptors(photosInterceptor)
  async update(
    @Param('id') id: number,
    @User('id') userId: number,
    @Body() updateTransactionRequest: UpdateTransactionRequest,
    @UploadedFiles() photos?: Express.Multer.File[],
  ): Promise<ResponseAPI<TransactionResponse>> {
    const { existingPhotos, ...rest } = updateTransactionRequest;
    const newPhotoUrls = await this.uploadPhotos(photos);
    const photosCmd =
      existingPhotos !== undefined || newPhotoUrls.length > 0
        ? { retain: existingPhotos ?? [], added: newPhotoUrls }
        : undefined;

    return this.transactionsService.update(id, userId, rest, photosCmd);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: number, @User('id') userId: number): Promise<void> {
    return this.transactionsService.delete(id, userId);
  }
}
