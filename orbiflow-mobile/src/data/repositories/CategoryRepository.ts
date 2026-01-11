import { Category } from '@domain/entities/Category';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { apiClient } from '../api/client';
import { CategoryMapper } from '../mappers/CategoryMapper';
import { CategoryListResponseDTO, CategoryResponseDTO } from '../api/dto/CategoryDTO';

export class CategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<CategoryListResponseDTO>('/categories');

    if (!response.data.data) return [];

    return CategoryMapper.toDomainList(response.data.data);
  }

  async getGlobal(): Promise<Category[]> {
    const response = await apiClient.get<CategoryListResponseDTO>('/categories/global');

    if (!response.data.data) return [];

    return CategoryMapper.toDomainList(response.data.data);
  }

  async getUserCategories(): Promise<Category[]> {
    const response = await apiClient.get<CategoryListResponseDTO>('/categories/user');

    if (!response.data.data) return [];

    return CategoryMapper.toDomainList(response.data.data);
  }

  async create(name: string, icon?: string, color?: string): Promise<Category> {
    const response = await apiClient.post<CategoryResponseDTO>('/categories', {
      name,
      icon,
      color,
    });

    return CategoryMapper.toDomain(response.data.data);
  }

  async getById(id: number): Promise<Category> {
    const response = await apiClient.get<CategoryResponseDTO>(`/categories/${id}`);
    return CategoryMapper.toDomain(response.data.data);
  }
}
