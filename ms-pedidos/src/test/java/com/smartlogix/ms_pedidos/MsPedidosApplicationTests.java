package com.smartlogix.ms_pedidos;

import feign.FeignException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class MsPedidosApplicationTests {

    @Test
    void contextLoads() { }

    @Value("${server.port}")
    private int port;
    
    @Test
    void portIs8082() { 
        assertEquals(8082, port); 
    }

    @Autowired
    private ApplicationContext ctx;
    
    @Test
    void feignClientsEnabled() {
        assertNotNull(ctx.getBean(InventarioClient.class));
    }

    @Autowired
    private InventarioClient inventarioClient;
    
    @Test
    void feignLanzaExcepcionSiServicioNoDisponible() {
        assertThrows(FeignException.class, () -> inventarioClient.obtenerProducto(1L));
    }

    @Value("${inventario.url:http://localhost:8081}")
    private String url;
    
    @Test
    void urlTieneValorDefault() {
        assertNotNull(url);
        assertTrue(url.startsWith("http"));
    }
}