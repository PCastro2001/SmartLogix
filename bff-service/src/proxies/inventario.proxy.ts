import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ProxyException } from './proxy.exception';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class InventarioProxy {
  private baseURL: string;
  private breaker: CircuitBreaker<[() => Promise<any>], any>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>('INVENTARIO_URL') || 'http://localhost:8081';
    this.breaker = new CircuitBreaker(
      async (action: () => Promise<any>) => action(),
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        errorFilter: (error: any) => {
          if (error?.response) {
            return error.response.status < 500;
          }
          return false;
        },
      },
    );
  }

  private normalizeError(error: any): never {
    if (error.message === 'Breaker is open') {
      throw new ProxyException('Circuit breaker abierto. El servicio no está disponible temporalmente.', 503);
    }

    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.mensaje ||
        error.response.data?.message ||
        error.response.statusText ||
        'Error en ms-inventario';
      throw new ProxyException(message, status);
    } else if (
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Timed out')
    ) {
      throw new ProxyException('timeout', 503);
    } else {
      throw new ProxyException('Error interno de red', 500);
    }
  }

  async getProductos(): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.get(`${this.baseURL}/productos`, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async getProductoById(id: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.get(`${this.baseURL}/productos/${id}`, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async createProducto(data: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.post(`${this.baseURL}/productos`, data, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async updateProducto(id: any, data: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.put(`${this.baseURL}/productos/${id}`, data, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async deleteProducto(id: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.delete(`${this.baseURL}/productos/${id}`, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async ajustarStock(id: any, cantidad: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.patch(`${this.baseURL}/productos/${id}/stock`, null, {
            timeout: 5000,
            params: { cantidad },
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async getBajoStock(): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.get(`${this.baseURL}/productos/bajo-stock`, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }
}
