import { ResponseTypeEnum } from "@/src/core/enums/response-type.enum";

export interface ResponseAPI<T = {}> {
  responseType?: ResponseTypeEnum;
  title?: string;
  message: string;
  data?: T;
}
