import { ResponseTypeEnum } from '../enum/response-type.enum';

export interface ResponseAPI<T = {}> {
  responseType?: ResponseTypeEnum;
  title?: string;
  message: string;
  data?: T;
}
