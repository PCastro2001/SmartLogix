import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { InventarioProxy } from '../src/proxies/inventario.proxy';
import { AxiosResponse } from 'axios';

describe('InventarioProxy', () => {
  let proxy: InventarioProxy;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventarioProxy,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8081'),
          },
        },
      ],
    }).compile();

    proxy = module.get<InventarioProxy>(InventarioProxy);
    httpService = module.get<HttpService>(HttpService);
  });

  test('getProductos retorna array de productos', async () => {
    const res: AxiosResponse = {
      data: [{ id: 1, nombre: 'Caja' }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
    jest.spyOn(httpService, 'get').mockReturnValue(of(res));
    const result = await proxy.getProductos();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].nombre).toBe('Caja');
  });

  test('getProductoById retorna producto por ID', async () => {
    const res: AxiosResponse = {
      data: { id: 5, nombre: 'Mesa' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
    jest.spyOn(httpService, 'get').mockReturnValue(of(res));
    const result = await proxy.getProductoById(5);
    expect(result.id).toBe(5);
  });

  test('createProducto retorna producto creado', async () => {
    const nuevo = { nombre: 'Silla', precio: 3000, stock: 20 };
    const res: AxiosResponse = {
      data: { id: 10, ...nuevo },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {} as any,
    };
    jest.spyOn(httpService, 'post').mockReturnValue(of(res));
    const result = await proxy.createProducto(nuevo);
    expect(result.id).toBe(10);
  });

  test('getProductoById con ID inexistente lanza error normalizado', async () => {
    const error = {
      response: {
        status: 404,
        data: { mensaje: 'No encontrado' },
      },
    };
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));
    await expect(proxy.getProductoById(999)).rejects.toMatchObject({
      status: 404,
      message: 'No encontrado',
    });
  });

  test('timeout de ms-inventario se normaliza a error 503', async () => {
    const error = {
      code: 'ECONNABORTED',
      message: 'timeout',
    };
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));
    await expect(proxy.getProductos()).rejects.toMatchObject({ status: 503 });
  });

  test('circuit breaker se abre tras multiples fallas y retorna 503', async () => {
    const error = new Error('Server Error');
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

    // Ejecutamos varias llamadas fallidas para abrir el breaker
    for (let i = 0; i < 15; i++) {
      try {
        await proxy.getProductos();
      } catch (e) {
        // Ignoramos el error para seguir fallando
      }
    }

    // La siguiente llamada debe fallar directamente por el breaker abierto (fail fast)
    await expect(proxy.getProductos()).rejects.toMatchObject({
      status: 503,
      message: 'Circuit breaker abierto. El servicio no está disponible temporalmente.',
    });
  });
});
