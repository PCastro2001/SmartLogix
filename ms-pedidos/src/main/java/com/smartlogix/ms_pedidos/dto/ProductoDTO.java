package com.smartlogix.ms_pedidos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDTO {
    private Long id;
    private String nombre;
    @com.fasterxml.jackson.annotation.JsonProperty("precio")
    private Double precioUnitario;
    private Integer stock;
}
