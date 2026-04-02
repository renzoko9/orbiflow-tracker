import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import { ResponseAPI } from "../api/dto/api-response.interface";
import { Category } from "../dto/category.interface";

class CategoryService extends HttpService {
  async findAll(): Promise<Category[]> {
    return this.get<Category[]>(ENDPOINTS.categories.base);
  }

  async findGlobal(): Promise<Category[]> {
    return this.get<Category[]>(ENDPOINTS.categories.global);
  }

  async findOne(id: number): Promise<Category> {
    return this.get<Category>(ENDPOINTS.categories.BY_ID(id));
  }
}

export default new CategoryService();
