package com.smartlogix.ms_inventario.service;

import com.smartlogix.ms_inventario.dto.ProductoDTO;
import com.smartlogix.ms_inventario.exception.ResourceNotFoundException;
import com.smartlogix.ms_inventario.model.Producto;
import com.smartlogix.ms_inventario.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository repo;

    @InjectMocks
    private ProductoService service;

    @Test
    void crearProductoAsignaActivoTrue() {
        ProductoDTO dto = new ProductoDTO("Mesa", "Madera", 50000.0, 20, 5);
        Producto productoGuardado = new Producto(1L, "Mesa", "Madera", 50000.0, 20, 5, true);
        
        when(repo.save(any())).thenReturn(productoGuardado);
        
        Producto result = service.crearProducto(dto);
        assertTrue(result.getActivo());
    }

    @Test
    void obtenerPorIdExistente() {
        Producto p = new Producto(1L, "Silla", "", 10000.0, 5, 1, true);
        when(repo.findById(1L)).thenReturn(Optional.of(p));
        
        Producto result = service.obtenerPorId(1L);
        assertEquals("Silla", result.getNombre());
    }

    @Test
    void ajustarStockSumaCorrectamente() {
        Producto p = new Producto(1L, "X", "", 100.0, 10, 2, true);
        when(repo.findById(1L)).thenReturn(Optional.of(p));
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));
        
        Producto result = service.ajustarStock(1L, 5);
        assertEquals(15, result.getStock());
    }

    @Test
    void obtenerPorIdInexistenteLanzaExcepcion() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.obtenerPorId(99L));
    }

    @Test
    void ajustarStockNegativoLanzaExcepcion() {
        Producto p = new Producto(1L, "Y", "", 100.0, 3, 1, true);
        when(repo.findById(1L)).thenReturn(Optional.of(p));
        
        assertThrows(IllegalArgumentException.class, () -> service.ajustarStock(1L, -10));
    }
}
