import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { Producto } from './producto.entity';
import { ProductoDTO } from './producto.dto';
import { ResourceNotFoundException } from './exceptions';
import { NotFoundException } from '@nestjs/common';

describe('ProductoController', () => {
  let controller: ProductoController;
  let service: ProductoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [
        {
          provide: ProductoService,
          useValue: {
            listarTodos: jest.fn(),
            listarBajoStock: jest.fn(),
            obtenerPorId: jest.fn(),
            crearProducto: jest.fn(),
            actualizarProducto: jest.fn(),
            eliminarProducto: jest.fn(),
            ajustarStock: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductoController>(ProductoController);
    service = module.get<ProductoService>(ProductoService);
  });

  it('getProductosRetorna200', async () => {
    const list = [new Producto(1, 'Caja', '', 1000.0, 50, 5, true)];
    jest.spyOn(service, 'listarTodos').mockResolvedValue(list);

    const result = await controller.listarTodos();
    expect(result).toEqual(list);
  });

  it('postProductoRetorna201', async () => {
    const p = new Producto(1, 'Mesa', '', 50000.0, 10, 2, true);
    const dto = new ProductoDTO('Mesa', '', 50000.0, 10, 2);
    jest.spyOn(service, 'crearProducto').mockResolvedValue(p);

    const result = await controller.crearProducto(dto);
    expect(result).toBe(p);
  });

  it('deleteProductoRetorna204', async () => {
    jest.spyOn(service, 'eliminarProducto').mockResolvedValue(undefined);

    await expect(controller.eliminarProducto(1)).resolves.toBeUndefined();
  });

  it('getProductoInexistenteRetorna404', async () => {
    jest.spyOn(service, 'obtenerPorId').mockRejectedValue(new ResourceNotFoundException('No encontrado'));

    await expect(controller.obtenerPorId(999)).rejects.toThrow('No encontrado');
  });
});
