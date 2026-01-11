import { Category } from '@domain/entities/Category';
import { CategoryResponseDTO } from '../api/dto/CategoryDTO';

export class CategoryMapper {
  static toDomain(dto: CategoryResponseDTO['data']): Category {
    if (!dto) throw new Error('Invalid DTO');

    return new Category(
      dto.id,
      dto.name,
      dto.icon,
      dto.color,
      dto.isGlobal,
      new Date(dto.createdAt)
    );
  }

  static toDomainList(dtoList: Array<CategoryResponseDTO['data']>): Category[] {
    return dtoList
      .filter(dto => dto !== null && dto !== undefined)
      .map(dto => this.toDomain(dto));
  }

  static toAPI(category: Partial<Category>) {
    return {
      name: category.name,
      icon: category.icon,
      color: category.color,
    };
  }
}
