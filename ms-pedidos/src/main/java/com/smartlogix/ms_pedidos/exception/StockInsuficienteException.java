package com.smartlogix.ms_pedidos.exception;

public class StockInsuficienteException extends RuntimeException {
    public StockInsuficienteException(String message) {
        super(message);
    }
}
