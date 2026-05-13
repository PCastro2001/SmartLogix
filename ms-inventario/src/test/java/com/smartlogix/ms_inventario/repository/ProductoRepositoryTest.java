package com.smartlogix.ms_inventario.repository;

import com.smartlogix.ms_inventario.model.Producto;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ProductoRepositoryTest {

    @Autowired
    private ProductoRepository repo;

    @Test
    void saveProductoSuccess() {
        Producto p = new Producto(null, "Caja", "Caja grande", 1500.0, 100, 10, true);
        Producto saved = repo.save(p);
        assertNotNull(saved.getId());
    }

    @Test
    void findActivosRetornaActivos() {
        repo.save(new Producto(null, "A", "", 100.0, 5, 1, true));
        repo.save(new Producto(null, "B", "", 200.0, 3, 1, false));
        List<Producto> activos = repo.findByActivoTrue();
        assertTrue(activos.stream().allMatch(Producto::getActivo));
    }

    @Test
    void findBajoStockRetornaProductos() {
        repo.save(new Producto(null, "C", "", 50.0, 2, 10, true));
        List<Producto> bajoStock = repo.findByStockLessThanEqual(10);
        assertFalse(bajoStock.isEmpty());
    }

    @Test
    void saveConNombreNullLanzaExcepcion() {
        Producto p = new Producto(null, null, "", 100.0, 5, 1, true);
        assertThrows(Exception.class, () -> repo.saveAndFlush(p));
    }

    @Test
    void saveConStockNegativoLanzaExcepcion() {
        Producto p = new Producto(null, "X", "", 100.0, -1, 1, true);
        assertThrows(Exception.class, () -> repo.saveAndFlush(p));
    }
}
