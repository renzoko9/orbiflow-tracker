import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseAPI } from '../interfaces/response.interface';
import { TipoRespuestaEnum } from '../enum/tipo-respuesta.enum';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Log del error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - ${exception.message}`,
    );

    // Determinar el tipo de respuesta según el status
    let tipoRespuesta = TipoRespuestaEnum.Error;
    let title = 'Error';

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        tipoRespuesta = TipoRespuestaEnum.Warning;
        title = 'Solicitud inválida';
        break;
      case HttpStatus.UNAUTHORIZED:
        tipoRespuesta = TipoRespuestaEnum.Error;
        title = 'No autorizado';
        break;
      case HttpStatus.FORBIDDEN:
        tipoRespuesta = TipoRespuestaEnum.Error;
        title = 'Acceso prohibido';
        break;
      case HttpStatus.NOT_FOUND:
        tipoRespuesta = TipoRespuestaEnum.Warning;
        title = 'No encontrado';
        break;
      case HttpStatus.CONFLICT:
        tipoRespuesta = TipoRespuestaEnum.Warning;
        title = 'Conflicto';
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        tipoRespuesta = TipoRespuestaEnum.Error;
        title = 'Error interno del servidor';
        break;
      default:
        tipoRespuesta = TipoRespuestaEnum.Error;
        title = 'Error';
    }

    // Extraer el mensaje del error
    let message: string;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      // Si el mensaje es un array (validaciones de class-validator), unirlo
      if (Array.isArray(exceptionResponse.message)) {
        message = exceptionResponse.message.join(', ');
      } else {
        message = exceptionResponse.message as string;
      }
    } else {
      message = 'Ha ocurrido un error';
    }

    // Construir la respuesta en formato ResponseAPI
    const errorResponse: ResponseAPI = {
      tipoRespuesta,
      title,
      message,
      data: undefined,
    };

    response.status(status).json(errorResponse);
  }
}
