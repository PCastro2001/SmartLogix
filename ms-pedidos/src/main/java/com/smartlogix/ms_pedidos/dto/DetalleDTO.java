package com.smartlogix.ms_pedidos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleDTO {
    private Long productoId;
    private Integer cantidad;
}
