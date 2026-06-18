import { Test, TestingModule } from '@nestjs/testing';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { Pedido, EstadoPedido } from './pedido.entity';
import { PedidoDTO, DetalleDTO } from './pedido.dto';
import { StockInsuficienteException, IllegalStateException } from './exceptions';

describe('PedidoController', () => {
  let controller: PedidoController;
  let service: PedidoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidoController],
      providers: [
        {
          provide: PedidoService,
          useValue: {
            listarTodos: jest.fn(),
            obtenerPorId: jest.fn(),
            crearPedido: jest.fn(),
            actualizarEstado: jest.fn(),
            listarPorCliente: jest.fn(),
            listarPorEstado: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PedidoController>(PedidoController);
    service = module.get<PedidoService>(PedidoService);
  });

  it('getPedidosRetorna200', async () => {
    jest.spyOn(service, 'listarTodos').mockResolvedValue([]);
    const result = await controller.listarTodos();
    expect(result).toEqual([]);
  });

  it('postPedidoRetorna201', async () => {
    const p = new Pedido(1, 1, EstadoPedido.PENDIENTE, new Date(), 5000.0, []);
    const dto = new PedidoDTO(1, [new DetalleDTO(1, 2)]);
    jest.spyOn(service, 'crearPedido').mockResolvedValue(p);

    const result = await controller.crearPedido(dto);
    expect(result).toBe(p);
  });

  it('getPedidosPorEstadoRetorna200', async () => {
    jest.spyOn(service, 'listarPorEstado').mockResolvedValue([]);
    const result = await controller.listarPorEstado('PENDIENTE');
    expect(result).toEqual([]);
  });

  it('crearPedidoStockInsuficienteRetorna409', async () => {
    const dto = new PedidoDTO(1, [new DetalleDTO(1, 999)]);
    jest.spyOn(service, 'crearPedido').mockRejectedValue(new StockInsuficienteException('Sin stock'));

    await expect(controller.crearPedido(dto)).rejects.toThrow('Sin stock');
  });

  it('actualizarEstadoInvalidoRetorna422', async () => {
    jest.spyOn(service, 'actualizarEstado').mockRejectedValue(new IllegalStateException('Transición inválida'));

    await expect(controller.actualizarEstado(1, { estado: 'PENDIENTE' })).rejects.toThrow('Transición inválida');
  });
});
