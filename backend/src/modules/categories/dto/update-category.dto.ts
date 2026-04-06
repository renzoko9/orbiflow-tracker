import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryTypeEnum } from '@Enums';
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
    enum: CategoryTypeEnum,
    example: CategoryTypeEnum.Expense,
    required: false,
  })
  @IsEnum(CategoryTypeEnum)
  @IsOptional()
  type?: CategoryTypeEnum;

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
