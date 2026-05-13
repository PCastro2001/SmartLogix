package com.smartlogix.ms_pedidos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Pedido pedido;
    
    private Long productoId;
    
    private Integer cantidad;
    
    private Double precioUnitario;
}
