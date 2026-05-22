import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionTypeEnum } from '@Enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryRequest {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Transporte',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Tipo de categoría',
    enum: TransactionTypeEnum,
    example: TransactionTypeEnum.Expense,
    required: false,
  })
  @IsEnum(TransactionTypeEnum)
  @IsOptional()
  type?: TransactionTypeEnum;

  @ApiProperty({
    description: 'Nombre del icono (lucide icon name)',
    example: 'shopping-cart',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Color en formato hexadecimal',
    example: '#ef4444',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;
}
