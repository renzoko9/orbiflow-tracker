import {
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionTypeEnum } from '@Enums';

export enum TransactionKindFilter {
  Transfer = 'transfer',
}

export class FilterTransactionsQuery {
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  @Type(() => Number)
  type?: TransactionTypeEnum;

  @IsOptional()
  @IsEnum(TransactionKindFilter)
  kind?: TransactionKindFilter;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
