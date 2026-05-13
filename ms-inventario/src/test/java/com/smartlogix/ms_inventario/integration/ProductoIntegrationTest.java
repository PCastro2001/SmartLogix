package com.smartlogix.ms_inventario.integration;

import com.smartlogix.ms_inventario.dto.ProductoDTO;
import com.smartlogix.ms_inventario.model.Producto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProductoIntegrationTest {

    @Autowired
    private TestRestTemplate rest;

    // ✅ TEST 1 — Flujo completo: crear y obtener producto
    @Test
    void crearYObtenerProducto() {
        ProductoDTO dto = new ProductoDTO("Palet", "Madera", 3000.0, 100, 10);
        ResponseEntity<Producto> created = rest.postForEntity("/productos", dto, Producto.class);
        assertEquals(HttpStatus.CREATED, created.getStatusCode());

        Long id = created.getBody().getId();
        ResponseEntity<Producto> fetched = rest.getForEntity("/productos/" + id, Producto.class);
        assertEquals("Palet", fetched.getBody().getNombre());
    }

    // ✅ TEST 2 — Ajuste de stock persiste correctamente
    @Test
    void ajustarStockFlujoCompleto() {
        Producto p = crearProductoTest("Cinta", 50);
        // Usamos exchange para PATCH ya que es más flexible con query params
        rest.exchange("/productos/" + p.getId() + "/stock?cantidad=20", HttpMethod.PATCH, null, Producto.class);
        
        Producto updated = rest.getForEntity("/productos/" + p.getId(), Producto.class).getBody();
        assertEquals(70, updated.getStock());
    }

    // ✅ TEST 3 — GET /productos/bajo-stock retorna productos con stock bajo
    @Test
    void bajoStockRetornaResultados() {
        crearProductoTest("Escaso", 2); // stock=2, stockMinimo=10 → bajo stock
        ResponseEntity<List> resp = rest.getForEntity("/productos/bajo-stock", List.class);
        assertFalse(resp.getBody().isEmpty());
    }

    // ❌ TEST 4 — Fallo esperado: ID inexistente retorna 404
    @Test
    void obtenerIdInexistenteRetorna404() {
        ResponseEntity<String> resp = rest.getForEntity("/productos/99999", String.class);
        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    }

    // ❌ TEST 5 — Fallo esperado: ajustar stock dejándolo negativo retorna 400
    @Test
    void ajustarStockNegativoRetorna400() {
        Producto p = crearProductoTest("Limitado", 3);
        ResponseEntity<String> resp = rest.exchange(
            "/productos/" + p.getId() + "/stock?cantidad=-100",
            HttpMethod.PATCH, null, String.class);
        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    }

    // Helper para crear productos en los tests
    private Producto crearProductoTest(String nombre, int stock) {
        ProductoDTO dto = new ProductoDTO(nombre, "Desc", 100.0, stock, 10);
        return rest.postForEntity("/productos", dto, Producto.class).getBody();
    }
}

// Extensión necesaria para arreglar un typo en el plan (rest.getGetEntity) 
// o simplemente corregirlo en el código. Corregiré rest.getGetEntity a rest.getForEntity.
