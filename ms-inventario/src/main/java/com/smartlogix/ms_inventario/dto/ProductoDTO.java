package com.smartlogix.ms_inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDTO {
    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;
    
    private String descripcion;
    
    @Positive(message = "El precio debe ser positivo")
    private Double precio;
    
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;
    
    private Integer stockMinimo;
}
