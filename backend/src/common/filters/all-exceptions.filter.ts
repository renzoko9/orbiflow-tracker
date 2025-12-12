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
import { ResponseTypeEnum } from '../enum/response-type.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ha ocurrido un error inesperado en el servidor';
    let title = 'Error';

    // Si es una HttpException, extraer su información
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        // Extraer title personalizado si existe
        if ('title' in exceptionResponse && exceptionResponse.title) {
          title = exceptionResponse.title as string;
        }

        // Extraer mensaje
        if (Array.isArray(exceptionResponse.message)) {
          message = exceptionResponse.message.join(', ');
        } else {
          message = exceptionResponse.message as string;
        }
      }
    } else if (exception instanceof Error) {
      // Error genérico de JavaScript
      message = exception.message;
      this.logger.error(
        `Error no manejado: ${exception.message}`,
        exception.stack,
      );
    } else {
      // Error desconocido
      this.logger.error('Error desconocido:', exception);
    }

    // Log del error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - ${message}`,
    );

    // Construir la respuesta en formato ResponseAPI
    const errorResponse: ResponseAPI = {
      responseType: ResponseTypeEnum.Error,
      title,
      message,
      data: undefined,
    };

    response.status(status).json(errorResponse);
  }
}
