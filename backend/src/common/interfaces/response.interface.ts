import { TipoRespuestaEnum } from '../enum/tipo-respuesta.enum';

export interface ResponseAPI<T = {}> {
  tipoRespuesta?: TipoRespuestaEnum;
  title?: string;
  message: string;
  data?: T;
}
