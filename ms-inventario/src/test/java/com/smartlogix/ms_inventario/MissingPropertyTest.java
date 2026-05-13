package com.smartlogix.ms_inventario;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest
class MissingPropertyTest {
    @Value("${propiedad.inexistente:#{null}}")
    private String prop;

    @Test
    void missingPropertyIsNull() {
        assertNull(prop);
    }
}
