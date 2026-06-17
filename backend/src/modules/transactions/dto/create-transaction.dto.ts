import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionTypeEnum } from '@Enums';
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
    enum: TransactionTypeEnum,
    example: TransactionTypeEnum.Expense,
  })
  @IsEnum(TransactionTypeEnum)
  @IsNotEmpty()
  type: TransactionTypeEnum;

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

  @ApiProperty({
    description:
      'Keys de objetos en storage (uso interno). Los clientes HTTP suben archivos en el campo multipart "photos"; el controller sube a R2 y guarda estas keys.',
    example: ['transactions/123e4567-e89b-12d3-a456-426614174000.jpg'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
