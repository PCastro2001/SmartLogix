package com.smartlogix.ms_inventario.controller;

import com.smartlogix.ms_inventario.exception.ResourceNotFoundException;
import com.smartlogix.ms_inventario.model.Producto;
import com.smartlogix.ms_inventario.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService service;

    @Test
    void getProductosRetorna200() throws Exception {
        when(service.listarTodos()).thenReturn(List.of(
            new Producto(1L, "Caja", "", 1000.0, 50, 5, true)
        ));
        mockMvc.perform(get("/productos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nombre").value("Caja"));
    }

    @Test
    void postProductoRetorna201() throws Exception {
        Producto p = new Producto(1L, "Mesa", "", 50000.0, 10, 2, true);
        when(service.crearProducto(any())).thenReturn(p);
        
        mockMvc.perform(post("/productos")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"nombre\":\"Mesa\",\"precio\":50000,\"stock\":10,\"stockMinimo\":2}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void deleteProductoRetorna204() throws Exception {
        doNothing().when(service).eliminarProducto(1L);
        mockMvc.perform(delete("/productos/1"))
            .andExpect(status().isNoContent());
    }

    @Test
    void getProductoInexistenteRetorna404() throws Exception {
        when(service.obtenerPorId(999L)).thenThrow(new ResourceNotFoundException("No encontrado"));
        
        mockMvc.perform(get("/productos/999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.mensaje").value("No encontrado"));
    }

    @Test
    void postConBodyInvalidoRetorna400() throws Exception {
        // La validación @Valid en el controller disparará un error antes de llegar al service
        mockMvc.perform(post("/productos")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"nombre\":\"\",\"precio\":-100}"))
            .andExpect(status().isBadRequest());
    }
}
