import { ResponseAPI } from "./dto/api-response.interface";

type ApiErrorResponse = Omit<ResponseAPI, "data">;

export class ApiError extends Error implements ApiErrorResponse {
  responseType?: ResponseAPI["responseType"];
  title?: string;
  errorCode?: string;
  status?: number;

  constructor(response: ApiErrorResponse, status?: number) {
    super(response.message);
    this.name = "ApiError";
    this.title = response.title;
    this.responseType = response.responseType;
    this.errorCode = response.errorCode;
    this.status = status;
  }
}
