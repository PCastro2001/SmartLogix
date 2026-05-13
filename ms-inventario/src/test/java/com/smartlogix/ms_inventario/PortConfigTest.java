package com.smartlogix.ms_inventario;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class PortConfigTest {
    @Value("${server.port}")
    private int port;

    @Test
    void portIsCorrect() {
        assertEquals(8081, port);
    }
}
