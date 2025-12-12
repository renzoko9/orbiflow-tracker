import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryType } from 'src/common/enum/category-type.enum';
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
    enum: CategoryType,
    example: CategoryType.EXPENSE,
    required: false,
  })
  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;
}
