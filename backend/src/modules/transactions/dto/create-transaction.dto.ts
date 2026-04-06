import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CategoryTypeEnum } from '@Enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionRequest {
  @ApiProperty({
    description: 'Monto de la transacción',
    example: 150.5,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Descripción de la transacción',
    example: 'Compra en supermercado',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Tipo de transacción',
    enum: CategoryTypeEnum,
    example: CategoryTypeEnum.Expense,
  })
  @IsEnum(CategoryTypeEnum)
  @IsNotEmpty()
  type: CategoryTypeEnum;

  @ApiProperty({
    description: 'Fecha de la transacción (formato ISO 8601)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'ID de la categoría',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    description: 'ID de la cuenta',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  accountId: number;
}
