package com.smartlogix.ms_pedidos.service;

import com.smartlogix.ms_pedidos.InventarioClient;
import com.smartlogix.ms_pedidos.dto.DetalleDTO;
import com.smartlogix.ms_pedidos.dto.PedidoDTO;
import com.smartlogix.ms_pedidos.dto.ProductoDTO;
import com.smartlogix.ms_pedidos.exception.StockInsuficienteException;
import com.smartlogix.ms_pedidos.model.DetallePedido;
import com.smartlogix.ms_pedidos.model.EstadoPedido;
import com.smartlogix.ms_pedidos.model.Pedido;
import com.smartlogix.ms_pedidos.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final InventarioClient inventarioClient;

    private static final Map<EstadoPedido, List<EstadoPedido>> TRANSICIONES_PERMITIDAS = Map.of(
            EstadoPedido.PENDIENTE, List.of(EstadoPedido.APROBADO, EstadoPedido.CANCELADO),
            EstadoPedido.APROBADO, List.of(EstadoPedido.ENVIADO, EstadoPedido.CANCELADO),
            EstadoPedido.ENVIADO, List.of(EstadoPedido.CANCELADO),
            EstadoPedido.CANCELADO, List.of()
    );

    @Transactional
    public Pedido crearPedido(PedidoDTO dto) {
        double total = 0.0;
        Pedido pedido = new Pedido();
        pedido.setClienteId(dto.getClienteId());
        pedido.setEstado(EstadoPedido.PENDIENTE);

        if (dto.getDetalles() != null) {
            for (DetalleDTO detalleDTO : dto.getDetalles()) {
                ProductoDTO producto = inventarioClient.obtenerProducto(detalleDTO.getProductoId());
                if (producto.getStock() < detalleDTO.getCantidad()) {
                    throw new StockInsuficienteException("Stock insuficiente para el producto: " + producto.getNombre());
                }

                double subtotal = producto.getPrecioUnitario() * detalleDTO.getCantidad();
                total += subtotal;

                DetallePedido detalle = new DetallePedido();
                detalle.setProductoId(producto.getId());
                detalle.setCantidad(detalleDTO.getCantidad());
                detalle.setPrecioUnitario(producto.getPrecioUnitario());
                detalle.setPedido(pedido);

                pedido.getDetalles().add(detalle);
            }
        }

        pedido.setTotal(total);
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido actualizarEstado(Long id, EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + id));

        EstadoPedido estadoActual = pedido.getEstado();
        List<EstadoPedido> estadosPermitidos = TRANSICIONES_PERMITIDAS.getOrDefault(estadoActual, List.of());

        if (!estadosPermitidos.contains(nuevoEstado)) {
            throw new IllegalStateException("Transición de estado no permitida desde " + estadoActual + " hacia " + nuevoEstado);
        }

        pedido.setEstado(nuevoEstado);
        return pedidoRepository.save(pedido);
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Pedido obtenerPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new com.smartlogix.ms_pedidos.exception.ResourceNotFoundException("Pedido no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarPorCliente(Long clienteId) {
        return pedidoRepository.findByClienteId(clienteId);
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarPorEstado(EstadoPedido estado) {
        return pedidoRepository.findByEstado(estado);
    }
}
