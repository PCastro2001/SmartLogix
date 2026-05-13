# BFF SmartLogix - Backend For Frontend

Este servicio actúa como una capa de fachada (Facade Pattern) y adaptador (Adapter Pattern) para unificar la comunicación entre el frontend y los microservicios de SmartLogix.

## Requisitos
- Node.js >= 18
- Microservicio de Inventario (`ms-inventario`)
- Microservicio de Pedidos (`ms-pedidos`)

## Instalación

1. Navegar a la carpeta del servicio:
   ```bash
   cd bff-service
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```

## Variables de Entorno

Crea un archivo `.env` en la raíz de `bff-service` con los siguientes valores:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto en el que corre el BFF | `8080` |
| `INVENTARIO_URL` | URL del microservicio de Inventario | `http://localhost:8081` |
| `PEDIDOS_URL` | URL del microservicio de Pedidos | `http://localhost:8082` |

## Endpoints del BFF (`/api`)

### Inventario
- `GET /api/inventario/productos`: Obtiene todos los productos.
- `GET /api/inventario/productos/:id`: Obtiene un producto por ID.
- `POST /api/inventario/productos`: Crea un nuevo producto.
- `PUT /api/inventario/productos/:id`: Actualiza un producto.
- `DELETE /api/inventario/productos/:id`: Elimina un producto.
- `PATCH /api/inventario/productos/:id/stock?cantidad=X`: Ajusta el stock de un producto.

### Pedidos
- `GET /api/pedidos`: Obtiene todos los pedidos.
- `GET /api/pedidos/:id`: Obtiene un pedido por ID.
- `POST /api/pedidos`: Crea un nuevo pedido.
- `PUT /api/pedidos/:id/estado`: Actualiza el estado de un pedido (enviar `estado` en el body).
- `DELETE /api/pedidos/:id`: Elimina/cancela un pedido.

### Dashboard
- `GET /api/dashboard`: Retorna estadísticas generales unificando datos de ambos microservicios.

## Ejecución

- **Desarrollo**: `npm run dev` (con nodemon)
- **Producción**: `npm start`
- **Tests**: `npm test`

---
*SmartLogix Backend - Evaluación 2 DSY1106*
