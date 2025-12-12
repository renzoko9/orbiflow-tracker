import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CategoryType } from 'src/common/enum/category-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionRequest {
  @ApiProperty({
    description: 'Monto de la transacción',
    example: 200.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'Descripción de la transacción',
    example: 'Pago de servicios',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Tipo de transacción',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
    required: false,
  })
  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;

  @ApiProperty({
    description: 'Fecha de la transacción (formato ISO 8601)',
    example: '2024-01-20',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'ID de la categoría',
    example: 2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    description: 'ID de la cuenta',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  accountId?: number;
}
