import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import { ResponseAPI } from "../api/dto/api-response.interface";
import {
  CreateTransactionRequest,
  TransactionResponse,
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
}

export default new TransactionService();
