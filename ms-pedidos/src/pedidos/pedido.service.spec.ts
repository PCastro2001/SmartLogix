import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoService } from './pedido.service';
import { Pedido, EstadoPedido } from './pedido.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { InventarioClient } from './inventario.client';
import { PedidoDTO, DetalleDTO, ProductoDTO } from './pedido.dto';
import { StockInsuficienteException, IllegalStateException } from './exceptions';

describe('PedidoService', () => {
  let service: PedidoService;
  let pedidoRepo: Repository<Pedido>;
  let detalleRepo: Repository<DetallePedido>;
  let inventarioClient: InventarioClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        {
          provide: getRepositoryToken(Pedido),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DetallePedido),
          useClass: Repository,
        },
        {
          provide: InventarioClient,
          useValue: {
            obtenerProducto: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PedidoService>(PedidoService);
    pedidoRepo = module.get<Repository<Pedido>>(getRepositoryToken(Pedido));
    detalleRepo = module.get<Repository<DetallePedido>>(getRepositoryToken(DetallePedido));
    inventarioClient = module.get<InventarioClient>(InventarioClient);
  });

  it('crearPedidoCalculaTotalCorrecto', async () => {
    const producto = new ProductoDTO(1, 'Mesa', 5000.0, 100);
    jest.spyOn(inventarioClient, 'obtenerProducto').mockResolvedValue(producto);

    const dto = new PedidoDTO(1, [new DetalleDTO(1, 3)]);
    jest.spyOn(pedidoRepo, 'save').mockImplementation(async (entity: any) => entity);

    const result = await service.crearPedido(dto);
    expect(result.total).toBe(15000.0);
  });

  it('crearPedidoEstadoInicialPendiente', async () => {
    const producto = new ProductoDTO(1, 'Silla', 2000.0, 50);
    jest.spyOn(inventarioClient, 'obtenerProducto').mockResolvedValue(producto);

    jest.spyOn(pedidoRepo, 'save').mockImplementation(async (entity: any) => entity);

    const result = await service.crearPedido(new PedidoDTO(2, [new DetalleDTO(1, 1)]));
    expect(result.estado).toBe(EstadoPedido.PENDIENTE);
  });

  it('transicionPendienteAAprobadoEsValida', async () => {
    const p = new Pedido(1, 1, EstadoPedido.PENDIENTE, new Date(), 1000.0, []);
    jest.spyOn(pedidoRepo, 'findOne').mockResolvedValue(p);
    jest.spyOn(pedidoRepo, 'save').mockImplementation(async (entity: any) => entity);

    const updated = await service.actualizarEstado(1, EstadoPedido.APROBADO);
    expect(updated.estado).toBe(EstadoPedido.APROBADO);
  });

  it('crearPedidoStockInsuficienteLanzaExcepcion', async () => {
    const producto = new ProductoDTO(1, 'Escaso', 100.0, 1); // solo 1 en stock
    jest.spyOn(inventarioClient, 'obtenerProducto').mockResolvedValue(producto);

    const dto = new PedidoDTO(1, [new DetalleDTO(1, 5)]); // pide 5
    await expect(service.crearPedido(dto)).rejects.toThrow(StockInsuficienteException);
  });

  it('transicionInvalidaLanzaExcepcion', async () => {
    const p = new Pedido(1, 1, EstadoPedido.ENVIADO, new Date(), 1000.0, []);
    jest.spyOn(pedidoRepo, 'findOne').mockResolvedValue(p);

    await expect(service.actualizarEstado(1, EstadoPedido.PENDIENTE)).rejects.toThrow(IllegalStateException);
  });
});
