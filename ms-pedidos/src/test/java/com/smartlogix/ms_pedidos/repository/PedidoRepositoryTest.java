package com.smartlogix.ms_pedidos.repository;

import com.smartlogix.ms_pedidos.model.DetallePedido;
import com.smartlogix.ms_pedidos.model.EstadoPedido;
import com.smartlogix.ms_pedidos.model.Pedido;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PedidoRepositoryTest {
    @Autowired private PedidoRepository pedidoRepo;
    @Autowired private DetallePedidoRepository detalleRepo;

    // ✅ TEST 1 — Guardar pedido con detalle persiste relación
    @Test
    void guardarPedidoConDetalle() {
        Pedido p = new Pedido(null, 1L, EstadoPedido.PENDIENTE, LocalDateTime.now(), 5000.0, new ArrayList<>());
        DetallePedido d = new DetallePedido(null, p, 10L, 2, 2500.0);
        p.getDetalles().add(d);
        Pedido saved = pedidoRepo.save(p);
        assertNotNull(saved.getId());
        assertEquals(1, saved.getDetalles().size());
    }

    // ✅ TEST 2 — findByEstado filtra correctamente
    @Test
    void findByEstadoFiltraCorrectamente() {
        pedidoRepo.save(new Pedido(null, 1L, EstadoPedido.PENDIENTE, LocalDateTime.now(), 1000.0, List.of()));
        pedidoRepo.save(new Pedido(null, 2L, EstadoPedido.ENVIADO, LocalDateTime.now(), 2000.0, List.of()));
        List<Pedido> pendientes = pedidoRepo.findByEstado(EstadoPedido.PENDIENTE);
        assertTrue(pendientes.stream().allMatch(p -> p.getEstado() == EstadoPedido.PENDIENTE));
    }

    // ✅ TEST 3 — findByClienteId retorna pedidos del cliente
    @Test
    void findByClienteIdRetornaPedidos() {
        pedidoRepo.save(new Pedido(null, 42L, EstadoPedido.APROBADO, LocalDateTime.now(), 3000.0, List.of()));
        assertFalse(pedidoRepo.findByClienteId(42L).isEmpty());
    }

    // ❌ TEST 4 — Fallo esperado: clienteId null viola constraint NotNull
    @Test
    void pedidoSinClienteIdLanzaExcepcion() {
        Pedido p = new Pedido(null, null, EstadoPedido.PENDIENTE, LocalDateTime.now(), 0.0, List.of());
        assertThrows(ConstraintViolationException.class, () -> pedidoRepo.saveAndFlush(p));
    }

    // ❌ TEST 5 — Fallo esperado: total negativo viola constraint PositiveOrZero
    @Test
    void pedidoConTotalNegativoLanzaExcepcion() {
        Pedido p = new Pedido(null, 1L, EstadoPedido.PENDIENTE, LocalDateTime.now(), -500.0, List.of());
        assertThrows(ConstraintViolationException.class, () -> pedidoRepo.saveAndFlush(p));
    }
}
