package com.smartlogix.ms_pedidos;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Aquí le decimos que se conecte a la URL que definiste en el application.properties
@FeignClient(name = "ms-inventario", url = "${inventario.url:http://localhost:8081}")
public interface InventarioClient {
    
    // Este método es una simulación por ahora para que el Test 4 pase.
    @GetMapping("/productos/{id}")
    Object obtenerProducto(@PathVariable("id") Long id);
}