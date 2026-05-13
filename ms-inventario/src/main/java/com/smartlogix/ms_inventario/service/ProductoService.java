package com.smartlogix.ms_inventario.service;

import com.smartlogix.ms_inventario.dto.ProductoDTO;
import com.smartlogix.ms_inventario.exception.ResourceNotFoundException;
import com.smartlogix.ms_inventario.model.Producto;
import com.smartlogix.ms_inventario.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository repo;

    public List<Producto> listarTodos() {
        return repo.findAll();
    }

    public List<Producto> listarBajoStock() {
        // Obtenemos todos los productos y filtramos por stock <= stockMinimo
        // O podríamos usar el método del repo si tuviéramos un valor fijo, 
        // pero el stockMinimo es por producto.
        return repo.findAll().stream()
                .filter(p -> p.getStock() <= p.getStockMinimo())
                .toList();
    }

    public Producto obtenerPorId(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
    }

    public Producto crearProducto(ProductoDTO dto) {
        Producto p = new Producto();
        p.setNombre(dto.getNombre());
        p.setDescripcion(dto.getDescripcion());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock());
        p.setStockMinimo(dto.getStockMinimo());
        p.setActivo(true); // Valor por defecto
        return repo.save(p);
    }

    public Producto actualizarProducto(Long id, ProductoDTO dto) {
        Producto p = obtenerPorId(id);
        p.setNombre(dto.getNombre());
        p.setDescripcion(dto.getDescripcion());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock());
        p.setStockMinimo(dto.getStockMinimo());
        return repo.save(p);
    }

    public void eliminarProducto(Long id) {
        Producto p = obtenerPorId(id);
        p.setActivo(false); // Soft delete
        repo.save(p);
    }

    public Producto ajustarStock(Long id, int cantidad) {
        Producto p = obtenerPorId(id);
        int nuevoStock = p.getStock() + cantidad;
        if (nuevoStock < 0) {
            throw new IllegalArgumentException("El stock resultante no puede ser negativo");
        }
        p.setStock(nuevoStock);
        return repo.save(p);
    }
}
