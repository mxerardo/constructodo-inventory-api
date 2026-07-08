# Constructodo Inventory API

API REST para gestión de inventario de una distribuidora de materiales para
la construcción, construida con Node.js, Express y MongoDB.

> **Estado del proyecto:** en desarrollo activo. CRUD básico funcional
> (Fase 2 completa). Próximo paso: autenticación con JWT y roles (Fase 3).
> Ver [progreso completo](#roadmap) abajo.

---

## Por qué este proyecto

Este proyecto, usa un caso de negocio real: gestioné inventario
en una distribuidora de materiales para la construcción, y ese contexto
(catálogo real, inconsistencias reales de datos) es la base de este
proyecto.

El catálogo original (`INVENTARIO_DE_TOTALES.csv`, ~345 productos) tenía
inconsistencias típicas de un sistema de punto de venta real: claves
duplicadas para el mismo producto, unidades de medida mezcladas sin
estandarizar, y errores de captura en los nombres de categorías. En vez de
limpiar los datos a mano, el script de importación (`seed.js`) normaliza
todo mediante reglas explícitas — ver sección [Decisiones técnicas](#decisiones-técnicas-relevantes).

## Stack

- **Runtime:** Node.js v20
- **Framework:** Express 5
- **Base de datos:** MongoDB + Mongoose 9
- **Autenticación:** JWT + bcrypt (Fase 3, en progreso)
- **Testing:** Jest + Supertest (Fase 5, pendiente)

## Cómo correrlo localmente

### Requisitos previos
- Node.js v20+
- MongoDB corriendo localmente (o una URI de Atlas)

### Instalación

```bash
git clone https://github.com/mxerardo/constructodo-inventory-api.git
cd constructodo-inventory-api
npm install
```

### Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

```
MONGODB_URI=mongodb://localhost:27017/constructodo
PORT=3000
```

### Cargar datos de ejemplo

El catálogo real (normalizado) se carga con:

```bash
npm run seed
```

Este script es idempotente — puedes correrlo varias veces sin duplicar
productos.

### Levantar el servidor

```bash
npm run dev
```

El servidor queda disponible en `http://localhost:3000`. Puedes confirmar
que está vivo con:

```bash
curl http://localhost:3000/health
```

## Endpoints disponibles

> Autenticación (JWT + roles `admin`/`consulta`) llega en Fase 3. Por ahora
> todos los endpoints están abiertos.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista productos activos (soporta filtros por query params) |
| GET | `/api/productos/:id` | Detalle de un producto |
| POST | `/api/productos` | Crea un producto nuevo |
| PUT | `/api/productos/:id` | Actualiza un producto existente |
| DELETE | `/api/productos/:id` | Soft delete (marca el producto como inactivo, no lo borra) |

### Ejemplo: crear un producto

**Request**
```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "clave": "CEMH25K",
    "descripcion": "BULTO CEMENTO HOLCIM APASCO 25 KG",
    "categoria": "cemento_y_agregados",
    "unidad": "bulto",
    "existencias": 40,
    "umbralMinimo": 10
  }'
```

**Response** `201 Created`
```json
{
  "_id": "64f9a2b3c1d4e5f6a7b8c9d0",
  "clave": "CEMH25K",
  "descripcion": "BULTO CEMENTO HOLCIM APASCO 25 KG",
  "categoria": "cemento_y_agregados",
  "unidad": "bulto",
  "existencias": 40,
  "umbralMinimo": 10,
  "activo": true,
  "stockBajo": false,
  "createdAt": "2026-07-08T20:27:36.389Z",
  "updatedAt": "2026-07-08T20:27:36.389Z"
}
```

### Ejemplo: producto no encontrado

```bash
curl http://localhost:3000/api/productos/64f9a2000000000000000000
```

**Response** `404 Not Found`
```json
{ "error": "Producto no encontrado" }
```

### Ejemplo: dato inválido (enum de categoría)

```json
{ "error": "Producto validation failed: categoria: Categoría \"x\" no es válida" }
```
`400 Bad Request`

## Decisiones técnicas relevantes

- **`categoria` y `unidad` como enums de Mongoose**, no strings libres —
  evita variantes por typo/mayúsculas que romperían reportes agregados
  más adelante.
- **Soft delete (`activo: false`) en vez de borrar el documento** —
  trazabilidad de inventario histórico e integridad referencial con
  futuras colecciones (ventas, movimientos).
- **Capa de service entre controlador y modelo** (`productoService.js`) —
  separa lógica de negocio del manejo de HTTP, facilita testing aislado
  más adelante (Fase 5).
- **Clase `AppError` con `statusCode` propio** — el middleware de errores
  centralizado (`errorHandler.js`) no adivina códigos HTTP por texto de
  mensaje, los lee directo del error.
- **Reglas de normalización en el seed** (`normalizar.js`) resuelven casos
  reales como distinguir "CAL." (calibre de cable) de "CAL" (cal de
  construcción), o rutear todas las variantes de "SEÑALITICA" —typo
  incluido, tal como aparece en el dato real— a `seguridad_industrial`.

## Roadmap

- [x] Fase 0 — Setup: estructura, Git, dependencias, conexión a MongoDB
- [x] Fase 1 — Modelo de Producto + normalización + seed con datos reales
- [x] Fase 2 — CRUD básico (rutas, controlador, service, manejo de errores)
- [ ] Fase 3 — Autenticación: JWT + roles (`admin` / `consulta`)
- [ ] Fase 4 — Búsqueda, filtros avanzados, reportes de stock bajo y resumen agregado
- [ ] Fase 5 — Tests con Jest + Supertest
- [ ] Fase 6 — Documentación completa + deploy

## Autor

**Mario Gerardo García** — Ingeniero Industrial en transición a desarrollo
de software. [GitHub](https://github.com/mxerardo)
