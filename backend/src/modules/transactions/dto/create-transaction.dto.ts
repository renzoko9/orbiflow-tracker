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
    description: 'URLs de fotos adjuntas al movimiento (evidencia)',
    example: ['/uploads/chat/recibo-123.jpg'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
