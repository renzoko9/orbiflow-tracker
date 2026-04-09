import { IsOptional, IsEnum, IsInt, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryTypeEnum } from '@Enums';

export class FilterTransactionsQuery {
  @IsOptional()
  @IsEnum(CategoryTypeEnum)
  @Type(() => Number)
  type?: CategoryTypeEnum;

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
