# SmartLogix Backend

Plataforma logística basada en microservicios para PYMEs de eCommerce.

## Estructura

| Componente       | Puerto | Responsable | Tecnología           |
|------------------|--------|-------------|----------------------|
| bff-service      | 8080   | Miguel      | Node.js · Express    |
| ms-inventario    | 8081   | Ian         | Spring Boot · JPA    |
| ms-pedidos       | 8082   | Pablo       | Spring Boot · JPA    |

## Levantar todo con Docker

```bash
docker-compose up --build