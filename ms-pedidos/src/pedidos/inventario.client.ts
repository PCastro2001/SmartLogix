import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ProductoDTO } from './pedido.dto';

@Injectable()
export class InventarioClient {
  private baseURL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>('INVENTARIO_URL') || 'http://localhost:8081';
  }

  async obtenerProducto(id: number): Promise<ProductoDTO> {
    const url = `${this.baseURL}/productos/${id}`;
    const response = await firstValueFrom(this.httpService.get(url, { timeout: 5000 }));
    const data = response.data;
    
    return new ProductoDTO(
      Number(data.id),
      data.nombre,
      Number(data.precio),
      Number(data.stock)
    );
  }
}
