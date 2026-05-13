package com.smartlogix.ms_pedidos.controller;

import com.smartlogix.ms_pedidos.exception.StockInsuficienteException;
import com.smartlogix.ms_pedidos.model.EstadoPedido;
import com.smartlogix.ms_pedidos.model.Pedido;
import com.smartlogix.ms_pedidos.service.PedidoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PedidoController.class)
class PedidoControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private PedidoService service;

    // ✅ TEST 1 — GET /pedidos retorna 200
    @Test
    void getPedidosRetorna200() throws Exception {
        when(service.listarTodos()).thenReturn(List.of());
        mockMvc.perform(get("/pedidos"))
            .andExpect(status().isOk());
    }

    // ✅ TEST 2 — POST /pedidos retorna 201
    @Test
    void postPedidoRetorna201() throws Exception {
        Pedido p = new Pedido(1L, 1L, EstadoPedido.PENDIENTE, LocalDateTime.now(), 5000.0, List.of());
        when(service.crearPedido(any())).thenReturn(p);
        mockMvc.perform(post("/pedidos")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"clienteId\":1,\"detalles\":[{\"productoId\":1,\"cantidad\":2}]}"))
            .andExpect(status().isCreated());
    }

    // ✅ TEST 3 — GET /pedidos/estado/PENDIENTE filtra por estado
    @Test
    void getPedidosPorEstadoRetorna200() throws Exception {
        when(service.listarPorEstado(EstadoPedido.PENDIENTE)).thenReturn(List.of());
        mockMvc.perform(get("/pedidos/estado/PENDIENTE"))
            .andExpect(status().isOk());
    }

    // ❌ TEST 4 — Fallo esperado: stock insuficiente retorna 409
    @Test
    void crearPedidoStockInsuficienteRetorna409() throws Exception {
        when(service.crearPedido(any())).thenThrow(new StockInsuficienteException("Sin stock"));
        mockMvc.perform(post("/pedidos")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"clienteId\":1,\"detalles\":[{\"productoId\":1,\"cantidad\":999}]}"))
            .andExpect(status().isConflict());
    }

    // ❌ TEST 5 — Fallo esperado: transición inválida retorna 422
    @Test
    void actualizarEstadoInvalidoRetorna422() throws Exception {
        when(service.actualizarEstado(eq(1L), any(EstadoPedido.class)))
            .thenThrow(new IllegalStateException("Transición inválida"));
        mockMvc.perform(put("/pedidos/1/estado")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"estado\":\"PENDIENTE\"}"))
            .andExpect(status().isUnprocessableEntity());
    }
}
