package com.smartlogix.ms_pedidos.service;

import com.smartlogix.ms_pedidos.InventarioClient;
import com.smartlogix.ms_pedidos.dto.DetalleDTO;
import com.smartlogix.ms_pedidos.dto.PedidoDTO;
import com.smartlogix.ms_pedidos.dto.ProductoDTO;
import com.smartlogix.ms_pedidos.exception.StockInsuficienteException;
import com.smartlogix.ms_pedidos.model.EstadoPedido;
import com.smartlogix.ms_pedidos.model.Pedido;
import com.smartlogix.ms_pedidos.repository.PedidoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock private PedidoRepository pedidoRepo;
    @Mock private InventarioClient inventarioClient;
    @InjectMocks private PedidoService service;

    // ✅ TEST 1 — crearPedido calcula total correctamente
    @Test
    void crearPedidoCalculaTotalCorrecto() {
        ProductoDTO producto = new ProductoDTO(1L, "Mesa", 5000.0, 100);
        when(inventarioClient.obtenerProducto(1L)).thenReturn(producto);
        PedidoDTO dto = new PedidoDTO(1L, List.of(new DetalleDTO(1L, 3)));
        when(pedidoRepo.save(any())).thenAnswer(i -> i.getArgument(0));
        Pedido result = service.crearPedido(dto);
        assertEquals(15000.0, result.getTotal());
    }

    // ✅ TEST 2 — crearPedido inicia en estado PENDIENTE
    @Test
    void crearPedidoEstadoInicialPendiente() {
        ProductoDTO producto = new ProductoDTO(1L, "Silla", 2000.0, 50);
        when(inventarioClient.obtenerProducto(1L)).thenReturn(producto);
        when(pedidoRepo.save(any())).thenAnswer(i -> i.getArgument(0));
        Pedido result = service.crearPedido(new PedidoDTO(2L, List.of(new DetalleDTO(1L, 1))));
        assertEquals(EstadoPedido.PENDIENTE, result.getEstado());
    }

    // ✅ TEST 3 — Transición PENDIENTE → APROBADO es válida
    @Test
    void transicionPendienteAAprobadoEsValida() {
        Pedido p = new Pedido(1L, 1L, EstadoPedido.PENDIENTE, LocalDateTime.now(), 1000.0, List.of());
        when(pedidoRepo.findById(1L)).thenReturn(Optional.of(p));
        when(pedidoRepo.save(any())).thenAnswer(i -> i.getArgument(0));
        Pedido updated = service.actualizarEstado(1L, EstadoPedido.APROBADO);
        assertEquals(EstadoPedido.APROBADO, updated.getEstado());
    }

    // ❌ TEST 4 — Fallo esperado: stock insuficiente lanza StockInsuficienteException
    @Test
    void crearPedidoStockInsuficienteLanzaExcepcion() {
        ProductoDTO producto = new ProductoDTO(1L, "Escaso", 100.0, 1); // solo 1 en stock
        when(inventarioClient.obtenerProducto(1L)).thenReturn(producto);
        assertThrows(StockInsuficienteException.class, () ->
            service.crearPedido(new PedidoDTO(1L, List.of(new DetalleDTO(1L, 5)))) // pide 5
        );
    }

    // ❌ TEST 5 — Fallo esperado: transición inválida ENVIADO → PENDIENTE lanza IllegalStateException
    @Test
    void transicionInvalidaLanzaExcepcion() {
        Pedido p = new Pedido(1L, 1L, EstadoPedido.ENVIADO, LocalDateTime.now(), 1000.0, List.of());
        when(pedidoRepo.findById(1L)).thenReturn(Optional.of(p));
        assertThrows(IllegalStateException.class, () ->
            service.actualizarEstado(1L, EstadoPedido.PENDIENTE)
        );
    }
}
