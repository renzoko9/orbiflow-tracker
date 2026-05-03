import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "../dto/account.interface";

class AccountService extends HttpService {
  async findAll(): Promise<Account[]> {
    return this.get<Account[]>(ENDPOINTS.accounts.base);
  }

  async findArchived(): Promise<Account[]> {
    return this.get<Account[]>(ENDPOINTS.accounts.ARCHIVED);
  }

  async findOne(id: number): Promise<Account> {
    return this.get<Account>(ENDPOINTS.accounts.BY_ID(id));
  }

  async create(data: CreateAccountRequest): Promise<Account> {
    return this.post<Account, CreateAccountRequest>(
      ENDPOINTS.accounts.base,
      data,
    );
  }

  async update(id: number, data: UpdateAccountRequest): Promise<Account> {
    return this.patch<Account, UpdateAccountRequest>(
      ENDPOINTS.accounts.BY_ID(id),
      data,
    );
  }

  async archive(id: number): Promise<Account> {
    return this.delete<Account>(ENDPOINTS.accounts.BY_ID(id));
  }

  async restore(id: number): Promise<Account> {
    return this.patch<Account, undefined>(ENDPOINTS.accounts.RESTORE(id));
  }
}

export default new AccountService();
