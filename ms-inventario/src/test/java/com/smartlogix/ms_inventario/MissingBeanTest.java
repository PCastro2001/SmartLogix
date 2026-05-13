package com.smartlogix.ms_inventario;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class MissingBeanTest {
    @Autowired
    private ApplicationContext ctx;

    @Test
    void missingBeanThrowsException() {
        assertThrows(NoSuchBeanDefinitionException.class, () ->
            ctx.getBean("servicioQueNoExiste")
        );
    }
}
