package com.smartlogix.ms_pedidos;

import com.smartlogix.ms_pedidos.dto.DetalleDTO;
import com.smartlogix.ms_pedidos.dto.PedidoDTO;
import com.smartlogix.ms_pedidos.model.EstadoPedido;
import com.smartlogix.ms_pedidos.model.Pedido;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import com.github.tomakehurst.wiremock.WireMockServer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PedidoIntegrationTest {

    @LocalServerPort
    private int port;

    private TestRestTemplate rest = new TestRestTemplate();

    private String getUrl(String path) {
        return "http://localhost:" + port + path;
    }

    private static WireMockServer wireMockServer;

    @BeforeAll
    static void setup() {
        wireMockServer = new WireMockServer(wireMockConfig().port(8081));
        wireMockServer.start();
        configureFor("localhost", 8081);
    }

    @AfterAll
    static void teardown() {
        wireMockServer.stop();
    }

    // ✅ TEST 1 — Crear pedido con stock disponible retorna 201
    @Test
    void crearPedidoConStockDisponible() {
        stubFor(get("/productos/1").willReturn(okJson(
            "{\"id\":1,\"nombre\":\"Mesa\",\"precio\":5000,\"stock\":100}")));
        ResponseEntity<Pedido> resp = rest.postForEntity(getUrl("/pedidos"),
            new PedidoDTO(1L, List.of(new DetalleDTO(1L, 3))), Pedido.class);
        assertEquals(HttpStatus.CREATED, resp.getStatusCode());
        assertEquals(EstadoPedido.PENDIENTE, resp.getBody().getEstado());
    }

    // ✅ TEST 2 — Total calculado correctamente
    @Test
    void totalCalculadoCorrectamente() {
        stubFor(get("/productos/2").willReturn(okJson(
            "{\"id\":2,\"nombre\":\"Silla\",\"precio\":2000,\"stock\":50}")));
        ResponseEntity<Pedido> resp = rest.postForEntity(getUrl("/pedidos"),
            new PedidoDTO(1L, List.of(new DetalleDTO(2L, 4))), Pedido.class);
        assertEquals(HttpStatus.CREATED, resp.getStatusCode());
        assertEquals(8000.0, resp.getBody().getTotal());
    }

    // ✅ TEST 3 — Actualizar estado PENDIENTE → APROBADO retorna 200
    @Test
    void actualizarEstadoPendienteAAprobado() {
        Pedido creado = crearPedidoTest();
        rest.put(getUrl("/pedidos/" + creado.getId() + "/estado"),
            Map.of("estado", EstadoPedido.APROBADO.name()));
        Pedido updated = rest.getForEntity(getUrl("/pedidos/" + creado.getId()), Pedido.class).getBody();
        assertEquals(EstadoPedido.APROBADO, updated.getEstado());
    }

    // ❌ TEST 4 — Fallo esperado: stock 0 retorna 409 Conflict
    @Test
    void crearPedidoSinStockRetorna409() {
        stubFor(get("/productos/3").willReturn(okJson(
            "{\"id\":3,\"nombre\":\"Escaso\",\"precio\":100,\"stock\":0}")));
        ResponseEntity<String> resp = rest.postForEntity(getUrl("/pedidos"),
            new PedidoDTO(1L, List.of(new DetalleDTO(3L, 1))), String.class);
        assertEquals(HttpStatus.CONFLICT, resp.getStatusCode());
    }

    // ❌ TEST 5 — Fallo esperado: pedido inexistente retorna 404
    @Test
    void obtenerPedidoInexistenteRetorna404() {
        ResponseEntity<String> resp = rest.getForEntity(getUrl("/pedidos/99999"), String.class);
        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    }

    private Pedido crearPedidoTest() {
        stubFor(get("/productos/99").willReturn(okJson(
                "{\"id\":99,\"nombre\":\"Generico\",\"precio\":1000,\"stock\":50}")));
        return rest.postForEntity(getUrl("/pedidos"),
                new PedidoDTO(1L, List.of(new DetalleDTO(99L, 1))), Pedido.class).getBody();
    }
}
