import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import { Account, CreateAccountRequest } from "../dto/account.interface";

class AccountService extends HttpService {
  async findAll(): Promise<Account[]> {
    return this.get<Account[]>(ENDPOINTS.accounts.base);
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
}

export default new AccountService();
