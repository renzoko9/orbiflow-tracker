import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import { ResponseAPI } from "../api/dto/api-response.interface";
import {
  CreateTransactionRequest,
  TransactionResponse,
  TransactionListResponse,
  FilterTransactionsParams,
} from "../dto/transaction.interface";

class TransactionService extends HttpService {
  async create(
    data: CreateTransactionRequest,
  ): Promise<ResponseAPI<TransactionResponse>> {
    return this.post<
      ResponseAPI<TransactionResponse>,
      CreateTransactionRequest
    >(ENDPOINTS.transactions.base, data);
  }

  async findAll(
    filters?: FilterTransactionsParams,
  ): Promise<TransactionListResponse[]> {
    const params = filters
      ? Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== undefined),
        )
      : undefined;

    return this.get<TransactionListResponse[]>(ENDPOINTS.transactions.base, {
      params,
    });
  }
}

export default new TransactionService();
