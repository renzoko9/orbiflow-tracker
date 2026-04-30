import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import { ResponseAPI } from "../api/dto/api-response.interface";
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionResponse,
  TransactionDetailResponse,
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

  async findOne(id: number): Promise<TransactionDetailResponse> {
    return this.get<TransactionDetailResponse>(
      ENDPOINTS.transactions.BY_ID(id),
    );
  }

  async update(
    id: number,
    data: UpdateTransactionRequest,
  ): Promise<ResponseAPI<TransactionResponse>> {
    return this.put<
      ResponseAPI<TransactionResponse>,
      UpdateTransactionRequest
    >(ENDPOINTS.transactions.BY_ID(id), data);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(ENDPOINTS.transactions.BY_ID(id));
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
