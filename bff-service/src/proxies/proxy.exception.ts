import { HttpException } from '@nestjs/common';

export class ProxyException extends HttpException {
  constructor(message: string, status: number) {
    super({ error: message }, status);
    (this as any).status = status;
    this.message = message;
  }
}

