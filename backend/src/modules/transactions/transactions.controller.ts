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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
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

const MAX_PHOTOS_PER_TRANSACTION = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const transactionPhotoStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'transactions'),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const rand = Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `transaction-${ts}-${rand}${ext}`);
  },
});

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
    storage: transactionPhotoStorage,
    limits: { fileSize: MAX_PHOTO_SIZE },
    fileFilter: photoFileFilter,
  },
);

function buildPhotoUrls(files: Express.Multer.File[] | undefined): string[] {
  if (!files || files.length === 0) return [];
  return files.map((file) => `/uploads/transactions/${file.filename}`);
}

@Controller('transactions')
@UseGuards(JwtAccessGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseInterceptors(photosInterceptor)
  create(
    @User('id') userId: number,
    @Body() createTransactionRequest: CreateTransactionRequest,
    @UploadedFiles() photos?: Express.Multer.File[],
  ): Promise<ResponseAPI<TransactionResponse>> {
    return this.transactionsService.create(userId, {
      ...createTransactionRequest,
      photos: buildPhotoUrls(photos),
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
  update(
    @Param('id') id: number,
    @User('id') userId: number,
    @Body() updateTransactionRequest: UpdateTransactionRequest,
    @UploadedFiles() photos?: Express.Multer.File[],
  ): Promise<ResponseAPI<TransactionResponse>> {
    const { existingPhotos, ...rest } = updateTransactionRequest;
    const newPhotoUrls = buildPhotoUrls(photos);
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
