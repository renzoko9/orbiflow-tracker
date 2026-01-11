// Contrato para repositorio de categorías
import { Category } from '../entities/Category';

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getGlobal(): Promise<Category[]>;
  getUserCategories(): Promise<Category[]>;
  create(name: string, icon?: string, color?: string): Promise<Category>;
  getById(id: number): Promise<Category>;
}
