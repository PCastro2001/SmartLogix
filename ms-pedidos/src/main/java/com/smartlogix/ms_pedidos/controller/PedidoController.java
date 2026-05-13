package com.smartlogix.ms_pedidos.controller;

import com.smartlogix.ms_pedidos.dto.PedidoDTO;
import com.smartlogix.ms_pedidos.model.EstadoPedido;
import com.smartlogix.ms_pedidos.model.Pedido;
import com.smartlogix.ms_pedidos.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<List<Pedido>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@RequestBody PedidoDTO dto) {
        Pedido pedidoCreado = pedidoService.crearPedido(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoCreado);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Pedido> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String estadoStr = body.get("estado");
        if (estadoStr == null) {
            throw new IllegalArgumentException("El campo 'estado' es requerido");
        }
        EstadoPedido nuevoEstado = EstadoPedido.valueOf(estadoStr.toUpperCase());
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, nuevoEstado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Pedido> cancelarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, EstadoPedido.CANCELADO));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Pedido>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(pedidoService.listarPorCliente(clienteId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Pedido>> listarPorEstado(@PathVariable EstadoPedido estado) {
        return ResponseEntity.ok(pedidoService.listarPorEstado(estado));
    }
}
