import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import { InsightResponse } from "../dto/insight.interface";

class InsightService extends HttpService {
  async getMonthly(): Promise<InsightResponse> {
    return this.get<InsightResponse>(ENDPOINTS.insights.monthly);
  }

  async getAccounts(): Promise<InsightResponse> {
    return this.get<InsightResponse>(ENDPOINTS.insights.accounts);
  }
}

export default new InsightService();
