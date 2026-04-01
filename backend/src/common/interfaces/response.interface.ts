import { ResponseTypeEnum } from '../enum/response-type.enum';

export interface ResponseAPI<T = {}> {
  responseType?: ResponseTypeEnum;
  title?: string;
  message: string;
  errorCode?: string;
  data?: T;
}
