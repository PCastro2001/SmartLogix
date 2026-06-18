import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoService } from './producto.service';
import { Producto } from './producto.entity';
import { ProductoDTO } from './producto.dto';
import { ResourceNotFoundException } from './exceptions';
import { BadRequestException } from '@nestjs/common';

describe('ProductoService', () => {
  let service: ProductoService;
  let repo: Repository<Producto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        {
          provide: getRepositoryToken(Producto),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repo = module.get<Repository<Producto>>(getRepositoryToken(Producto));
  });

  it('crearProductoAsignaActivoTrue', async () => {
    const dto = new ProductoDTO('Mesa', 'Madera', 50000.0, 20, 5);
    const productoGuardado = new Producto(1, 'Mesa', 'Madera', 50000.0, 20, 5, true);

    jest.spyOn(repo, 'save').mockResolvedValue(productoGuardado);

    const result = await service.crearProducto(dto);
    expect(result.activo).toBe(true);
  });

  it('obtenerPorIdExistente', async () => {
    const p = new Producto(1, 'Silla', '', 10000.0, 5, 1, true);
    jest.spyOn(repo, 'findOne').mockResolvedValue(p);

    const result = await service.obtenerPorId(1);
    expect(result.nombre).toBe('Silla');
  });

  it('ajustarStockSumaCorrectamente', async () => {
    const p = new Producto(1, 'X', '', 100.0, 10, 2, true);
    jest.spyOn(repo, 'findOne').mockResolvedValue(p);
    jest.spyOn(repo, 'save').mockImplementation(async (entity: any) => entity);

    const result = await service.ajustarStock(1, 5);
    expect(result.stock).toBe(15);
  });

  it('obtenerPorIdInexistenteLanzaExcepcion', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue(null);
    await expect(service.obtenerPorId(99)).rejects.toThrow(ResourceNotFoundException);
  });

  it('ajustarStockNegativoLanzaExcepcion', async () => {
    const p = new Producto(1, 'Y', '', 100.0, 3, 1, true);
    jest.spyOn(repo, 'findOne').mockResolvedValue(p);

    await expect(service.ajustarStock(1, -10)).rejects.toThrow(BadRequestException);
  });
});
