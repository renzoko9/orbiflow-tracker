import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import { Account } from "../dto/account.interface";

class AccountService extends HttpService {
  async findAll(): Promise<Account[]> {
    return this.get<Account[]>(ENDPOINTS.accounts.base);
  }

  async findOne(id: number): Promise<Account> {
    return this.get<Account>(ENDPOINTS.accounts.BY_ID(id));
  }
}

export default new AccountService();
