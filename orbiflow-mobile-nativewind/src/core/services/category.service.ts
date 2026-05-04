import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import { ResponseAPI } from "../api/dto/api-response.interface";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../dto/category.interface";

class CategoryService extends HttpService {
  async findAll(): Promise<Category[]> {
    return this.get<Category[]>(ENDPOINTS.categories.base);
  }

  async findGlobal(): Promise<Category[]> {
    return this.get<Category[]>(ENDPOINTS.categories.global);
  }

  async findArchived(): Promise<Category[]> {
    return this.get<Category[]>(ENDPOINTS.categories.ARCHIVED);
  }

  async findOne(id: number): Promise<Category> {
    return this.get<Category>(ENDPOINTS.categories.BY_ID(id));
  }

  async create(data: CreateCategoryRequest): Promise<ResponseAPI<Category>> {
    return this.post<ResponseAPI<Category>, CreateCategoryRequest>(
      ENDPOINTS.categories.base,
      data,
    );
  }

  async update(id: number, data: UpdateCategoryRequest): Promise<Category> {
    return this.put<Category, UpdateCategoryRequest>(
      ENDPOINTS.categories.BY_ID(id),
      data,
    );
  }

  async archive(id: number): Promise<Category> {
    return this.delete<Category>(ENDPOINTS.categories.BY_ID(id));
  }

  async restore(id: number): Promise<Category> {
    return this.patch<Category, undefined>(ENDPOINTS.categories.RESTORE(id));
  }
}

export default new CategoryService();
