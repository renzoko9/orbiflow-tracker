import { HttpException, HttpStatus } from '@nestjs/common';

export interface CustomExceptionResponse {
  title?: string;
  message: string;
}

export class CustomHttpException extends HttpException {
  constructor(
    response: CustomExceptionResponse | string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    // Si es un string, convertirlo a objeto con title por defecto
    if (typeof response === 'string') {
      super({ title: 'Error', message: response }, status);
    } else {
      // Si no tiene title, agregar "Error" por defecto
      super({ title: response.title || 'Error', message: response.message }, status);
    }
  }
}

// Excepciones personalizadas específicas
export class CustomBadRequestException extends CustomHttpException {
  constructor(response: CustomExceptionResponse | string) {
    super(response, HttpStatus.BAD_REQUEST);
  }
}

export class CustomNotFoundException extends CustomHttpException {
  constructor(response: CustomExceptionResponse | string) {
    super(response, HttpStatus.NOT_FOUND);
  }
}

export class CustomUnauthorizedException extends CustomHttpException {
  constructor(response: CustomExceptionResponse | string) {
    super(response, HttpStatus.UNAUTHORIZED);
  }
}

export class CustomForbiddenException extends CustomHttpException {
  constructor(response: CustomExceptionResponse | string) {
    super(response, HttpStatus.FORBIDDEN);
  }
}

export class CustomConflictException extends CustomHttpException {
  constructor(response: CustomExceptionResponse | string) {
    super(response, HttpStatus.CONFLICT);
  }
}

export class CustomInternalServerErrorException extends CustomHttpException {
  constructor(response: CustomExceptionResponse | string) {
    super(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
