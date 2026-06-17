import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionTypeEnum } from '@Enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionRequest {
  @ApiProperty({
    description: 'Monto de la transacción',
    example: 200.0,
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
    enum: TransactionTypeEnum,
    example: TransactionTypeEnum.Expense,
    required: false,
  })
  @IsEnum(TransactionTypeEnum)
  @IsOptional()
  type?: TransactionTypeEnum;

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

  @ApiProperty({
    description:
      'Keys de fotos existentes que se conservan. Las keys no incluidas se eliminan; los archivos nuevos se suben como multipart en el campo "photos".',
    example: ['transactions/123e4567-e89b-12d3-a456-426614174000.jpg'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown => {
    if (value === undefined || value === null) return value;
    const arr = Array.isArray(value) ? value : [value];
    return arr.filter(
      (v): v is string => typeof v === 'string' && v.length > 0,
    );
  })
  existingPhotos?: string[];
}
