import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resBody = exception.getResponse();
      if (typeof resBody === 'object' && resBody !== null) {
        mensaje = (resBody as any).message || exception.message;
        if (Array.isArray(mensaje)) {
          mensaje = mensaje.join(', ');
        }
      } else {
        mensaje = exception.message;
      }
    } else if (exception.message) {
      mensaje = exception.message;
      if (exception.name === 'ResourceNotFoundException' || exception.name === 'EntityNotFoundError') {
        status = HttpStatus.NOT_FOUND;
      } else if (exception.name === 'IllegalArgumentException' || exception instanceof TypeError) {
        status = HttpStatus.BAD_REQUEST;
      }
    }

    response.status(status).json({
      mensaje: mensaje,
      timestamp: new Date().toISOString(),
    });
  }
}
