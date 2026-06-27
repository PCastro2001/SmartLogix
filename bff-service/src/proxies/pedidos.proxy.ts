import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ProxyException } from './proxy.exception';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class PedidosProxy {
  private baseURL: string;
  private breaker: CircuitBreaker<[() => Promise<any>], any>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>('PEDIDOS_URL') || 'http://localhost:8082';
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
        'Error en ms-pedidos';
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

  async getPedidos(): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.get(`${this.baseURL}/pedidos`, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async getPedidoById(id: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.get(`${this.baseURL}/pedidos/${id}`, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async createPedido(data: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.post(`${this.baseURL}/pedidos`, data, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async updateEstadoPedido(id: any, estado: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.put(
            `${this.baseURL}/pedidos/${id}/estado`,
            { estado },
            { timeout: 5000 },
          ),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async deletePedido(id: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.delete(`${this.baseURL}/pedidos/${id}`, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async getPedidosPorCliente(clienteId: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.get(`${this.baseURL}/pedidos/cliente/${clienteId}`, {
            timeout: 5000,
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async getPedidosPorEstado(estado: any): Promise<any> {
    try {
      const response = await this.breaker.fire(() =>
        firstValueFrom(
          this.httpService.get(`${this.baseURL}/pedidos/estado/${estado}`, { timeout: 5000 }),
        ),
      );
      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }
}
