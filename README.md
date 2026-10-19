# Backend de Turnos y Reservas - Pre-entrega 8

API REST de servicios y reservas con MongoDB, vistas con Handlebars y tiempo real con Socket.io. En esta entrega se agregan **filtros, paginación y ordenamiento**, **validación con Zod** y **consulta de reservas con `populate`**.

## Instalación y ejecución

1. Tener un cluster de [MongoDB Atlas](https://www.mongodb.com/atlas) con un usuario y tu IP habilitada, y copiar la cadena de conexión.
2. Instalar, configurar y ejecutar:

```bash
git clone https://github.com/Teovi13/backend-turnos-pe8.git
cd backend-turnos-pe8
npm install
cp .env.example .env
npm run seed
npm start
```

`npm run seed` carga servicios de ejemplo si la colección está vacía. Vistas: `/views/services` y `/views/availability`.

## Variables de entorno

| Variable    | Ejemplo                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| `PORT`      | `8080`                                                                   |
| `NODE_ENV`  | `development`                                                            |
| `MONGO_URI` | `mongodb+srv://usuario:clave@cluster0.xxxxx.mongodb.net/turnos_reservas` |

## Arquitectura

```
router → validate (Zod) → controller → service → repository → DAO → model → MongoDB
```

- `schemas/`: esquemas de Zod.
- `middlewares/validate.middleware.js`: valida `params`, `query` y `body` antes del controller.
- Los filtros y la paginación se arman en el service y se ejecutan en el DAO. Las rutas no contienen lógica.

## Filtros, paginación y ordenamiento

`GET /api/services` acepta estos query params, todos opcionales y combinables:

| Param       | Valores                                 | Por defecto        |
| ----------- | --------------------------------------- | ------------------ |
| `category`  | texto (sin distinguir mayúsculas)       | todas              |
| `available` | `true` / `false`                        | todos              |
| `page`      | entero ≥ 1                              | `1`                |
| `limit`     | entero entre 1 y 50                     | `10`               |
| `sortBy`    | `name`, `price`, `duration`, `category` | orden de creación  |
| `order`     | `asc` / `desc`                          | `asc`              |

```bash
curl "http://localhost:8080/api/services?category=salud&available=true"
curl "http://localhost:8080/api/services?page=2&limit=5"
curl "http://localhost:8080/api/services?sortBy=price&order=desc"
```

Respuesta de `GET /api/services?limit=2&sortBy=price` (servicios resumidos):

```json
{
  "status": "success",
  "payload": [
    { "id": "...", "name": "Corte de pelo", "price": 8000 },
    { "id": "...", "name": "Limpieza facial", "price": 11000 }
  ],
  "totalDocs": 4,
  "limit": 2,
  "page": 1,
  "totalPages": 2,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2,
  "prevLink": null,
  "nextLink": "/api/services?sortBy=price&order=asc&limit=2&page=2"
}
```

## Validaciones con Zod

Si los datos no cumplen el esquema, la API responde 400 sin llegar a MongoDB:

| Endpoint                                 | Reglas                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `POST /api/services`                     | `name`, `description`, `category` texto no vacío; `duration` entero > 0; `price` ≥ 0; `available` booleano |
| `PUT /api/services/:sid`                 | Mismas reglas para cada campo enviado; al menos un campo                                          |
| `POST /api/bookings`                     | `clientName` obligatorio; `clientEmail` email válido; `date` `YYYY-MM-DD` real; `time` `HH:MM`; `status` `pending`, `confirmed` o `cancelled` |
| `POST /api/bookings/:bid/services/:sid`  | `bid` y `sid` con formato de ObjectId                                                             |
| `GET /api/services`                      | Query params de la tabla anterior                                                                 |

Ejemplo de error:

```json
{
  "status": "error",
  "error": "price debe ser un número; available es obligatorio",
  "details": [
    { "field": "price", "message": "price debe ser un número" },
    { "field": "available", "message": "available es obligatorio" }
  ]
}
```

## Reservas con `populate`

La reserva guarda solo referencias: `services: [{ service: ObjectId, quantity }]`. `GET /api/bookings/:bid` usa `populate` para devolver los datos completos de cada servicio, junto con los datos de la reserva y el `total`:

```bash
curl http://localhost:8080/api/bookings/<bid>
```

```json
{
  "status": "success",
  "payload": {
    "id": "6650f3c4d5e6f7a8b9c0d1e2",
    "clientName": "Ana Pérez",
    "clientEmail": "ana@mail.com",
    "date": "2026-11-05",
    "time": "10:30",
    "status": "pending",
    "services": [
      {
        "service": { "id": "6650f1a2b3c4d5e6f7a8b9c0", "name": "Consulta médica general", "price": 12000, "duration": 30, "category": "salud", "available": true },
        "quantity": 2
      }
    ],
    "total": 24000
  }
}
```

## Endpoints

| Método | Ruta                               | Descripción                                        | Códigos       |
| ------ | ---------------------------------- | -------------------------------------------------- | ------------- |
| GET    | `/api/services`                    | Lista con filtros, paginación y orden              | 200, 400      |
| GET    | `/api/services/:sid`               | Obtiene un servicio                                | 200, 400, 404 |
| POST   | `/api/services`                    | Crea un servicio                                   | 201, 400      |
| PUT    | `/api/services/:sid`               | Actualiza un servicio                              | 200, 400, 404 |
| DELETE | `/api/services/:sid`               | Elimina un servicio                                | 200, 400, 404 |
| POST   | `/api/bookings`                    | Crea una reserva                                   | 201, 400      |
| GET    | `/api/bookings/:bid`               | Obtiene una reserva con servicios completos        | 200, 400, 404 |
| POST   | `/api/bookings/:bid/services/:sid` | Agrega un servicio (incrementa `quantity` si ya estaba) | 200, 400, 404 |

400: datos inválidos o servicio no disponible. 404: el recurso no existe.
