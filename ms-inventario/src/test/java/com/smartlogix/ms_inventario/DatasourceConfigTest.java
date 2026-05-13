package com.smartlogix.ms_inventario;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class DatasourceConfigTest {
    @Value("${spring.datasource.url}")
    private String dsUrl;

    @Test
    void datasourceIsH2() {
        assertTrue(dsUrl.contains("h2"));
    }
}
