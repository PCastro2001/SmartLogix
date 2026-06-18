# SmartLogix Backend

Plataforma logística basada en microservicios para PYMEs de eCommerce.

## Estructura

| Componente       | Puerto | Responsable | Tecnología           |
|------------------|--------|-------------|----------------------|
| bff-service      | 8080   | Miguel      | Node.js · Nest.js    |
| ms-inventario    | 8081   | Ian         | Node.js · Nest.js    |
| ms-pedidos       | 8082   | Pablo       | Node.js · Nest.js    |

## Levantar todo con Docker

```bash
docker-compose up --build