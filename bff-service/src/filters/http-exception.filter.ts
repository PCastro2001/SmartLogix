import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { ProxyException } from '../proxies/proxy.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let isProxyError = false;

    if (exception instanceof ProxyException) {
      const origStatus = exception.getStatus();
      status = origStatus >= 500 ? 502 : (origStatus || 500);
      isProxyError = true;
      const resBody = exception.getResponse();
      message = (resBody as any).error;
    } else if (exception instanceof HttpException) {
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
    }

    if (isProxyError) {
      response.status(status).json({
        error: message,
      });
    } else {
      response.status(status).json({
        error: message,
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
      });
    }
  }
}
