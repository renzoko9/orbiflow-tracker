import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryType } from 'src/common/enum/category-type.enum';

export class UpdateCategoryRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;
}
