import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resBody = exception.getResponse();
      if (typeof resBody === 'object' && resBody !== null) {
        message = (resBody as any).message || exception.message;
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      } else {
        message = exception.message;
      }
    } else if (exception.message) {
      message = exception.message;
      if (exception.name === 'ResourceNotFoundException' || exception.name === 'EntityNotFoundError') {
        status = HttpStatus.NOT_FOUND;
      } else if (exception.name === 'StockInsuficienteException') {
        status = HttpStatus.CONFLICT;
      } else if (exception.name === 'IllegalStateException') {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
      } else if (exception.name === 'IllegalArgumentException' || exception instanceof TypeError) {
        status = HttpStatus.BAD_REQUEST;
      }
    }

    const statusMap: Record<number, string> = {
      400: 'Bad Request',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
    };
    error = statusMap[status] || 'Http Error';

    response.status(status).json({
      timestamp: new Date().toISOString(),
      status: status,
      error: error,
      message: message,
    });
  }
}
