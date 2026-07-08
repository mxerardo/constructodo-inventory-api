# AGENTS.md — Contexto del proyecto Constructodo Inventory API

> Este archivo existe para que cualquier sesión futura (con Claude, con otro
> agente, o para el propio Mario releyéndolo en unos meses) tenga el
> contexto completo del proyecto sin tener que reconstruirlo desde cero.
> Actualízalo al cerrar cada fase.

---

## Quién y por qué

**Mario Gerardo García** — Industrial Engineer con 10+ años de experiencia
(manufactura, salud, ventas), en la recta final de una carrera de Ingeniería
en Software (Guanajuato, México). Objetivo: conseguir su primer empleo como
desarrollador de software construyendo un portafolio de GitHub sólido que
lo posicione como **entry-level developer**, no como "career changer" que
enfatiza su trasfondo en ingeniería industrial.

Dos focos técnicos: Python (proyectos de IA/automatización ya en marcha) y
Node.js/Express/MongoDB como segundo stack — eligió Node/Express sobre
Flask para este portafolio.

Este proyecto (`constructodo-inventory-api`) cierra la brecha de portafolio
en Node/Express + MongoDB, usando un caso de negocio real: gestión de
inventario para una distribuidora de materiales para la construcción donde
Mario trabajó. El catálogo real (`INVENTARIO_DE_TOTALES.csv`, 345
productos) tiene inconsistencias reales (claves duplicadas, unidades
mezcladas, typos de origen) que se usan como material legítimo de práctica
para normalización de datos — no como algo a ocultar.

Repo público: **https://github.com/mxerardo/constructodo-inventory-api**

---

## Cómo trabajamos (método pedagógico — importante para futuras sesiones)

Mario explícitamente pidió pasar de "recibir código terminado" a
**aprender haciendo**. El patrón establecido:

1. Claude plantea una pregunta conceptual o una tarea concreta
2. Mario responde con su razonamiento (o intenta escribir el código)
3. Claude confirma/corrige y explica el porqué técnico, no solo el qué
4. Mario escribe o corrige el código él mismo
5. Claude revisa de forma iterativa, no todo de golpe

Mario prefiere entender el *por qué* de cada decisión, porque necesita
poder defenderlas en entrevista. Es hands-on en terminal y editor —
ejecuta cada paso él mismo, Claude no ejecuta comandos por él.

**Excepción explícita ya acordada**: cuando el repaso socrático deja de
sumar aprendizaje nuevo y solo consume tiempo (ej. iterar a mano una
función ya varias veces corregida), Mario puede pedir "dame el código
completo y la explicación de cómo se llegó ahí" para avanzar más rápido.
Claude debe respetar esa señal sin insistir en seguir preguntando.

Cuando Mario comparte un resultado de terminal con algo inesperado (un
mensaje raro, un dominio desconocido, un warning), Claude lo investiga
antes de asumir que es inofensivo o de restarle importancia — ya pasó una
vez con un mensaje promocional de `dotenv` que parecía sospechoso y se
verificó con búsqueda web antes de tranquilizar a Mario.

---

## Entorno técnico de Mario

- **SO**: Ubuntu (Linux 6.18.5), terminal **Warp**
- **Node**: v20.14.0 (nota: algunas dependencias como mongoose@9.x piden
  >=20.19.0 vía `engines`; solo genera warnings `EBADENGINE`, no bloquea
  nada — no se ha actualizado Node, funciona bien tal cual)
- **MongoDB**: 8.0.26, local, corriendo como servicio (`systemctl status
  mongod` para verificar; `mongosh` para explorar a mano)
- **Editor**: VS Code (edición de archivos) + `nano` (ediciones rápidas
  desde terminal)
- **Git/GitHub**: usuario de GitHub `mxerardo`, autenticado con `gh` CLI
  vía SSH (llave ya existente, título `gerardo-ubuntu-warp`)
- Mario tiene buen dominio de terminal pero base débil de JavaScript —
  necesita explicaciones detalladas de sintaxis (if/else, `&&` vs `||`,
  paréntesis balanceados, `.includes()` vs regex) la primera vez que
  aparecen, no asumir que las conoce.

---

## Stack y versiones reales instaladas

Instalado con `npm install <paquete>` sin fijar versión, así que son más
nuevas que las "estándar" de tutoriales — importante tenerlo presente
porque ya causó al menos un bug real (ver "Bugs reales encontrados"):

```
express@^5.2.1        (Express 5, no 4 — cambios de sintaxis en rutas/wildcards)
mongoose@^9.7.3
bcrypt@^6.0.0
jsonwebtoken@^9.0.3
cors@^2.8.6
dotenv@^17.4.2
csv-parse@^7.0.1
nodemon@^3.1.14  (dev)
jest@^30.4.2     (dev)
supertest@^7.2.2 (dev)
```

---

## Plan de fases (referencia: `constructodo-inventory-api-plan.md`)

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Setup: estructura, Git, dependencias, .env, conexión Mongo | ✅ Completa |
| 1 | Modelo Producto + normalización + seed con CSV real | ✅ Completa |
| 2 | CRUD básico (rutas + controladores, sin auth), manejo de errores centralizado | ⏭️ Siguiente |
| 3 | Autenticación: modelo Usuario, bcrypt, JWT, middleware de roles | Pendiente |
| 4 | Búsqueda, filtros, reportes de stock bajo y resumen agregado | Pendiente |
| 5 | Tests con Jest + Supertest | Pendiente |
| 6 | Documentación de API y publicación (README, Postman/Thunder Client, deploy opcional) | Pendiente |

---

## Estructura del proyecto (tal como existe hoy)

```
constructodo-inventory-api/
├── .env                  # real, nunca se sube (gitignored)
├── .env.example           # plantilla, sí se sube
├── .gitignore
├── package.json
├── data/
│   └── INVENTARIO_DE_TOTALES.csv   # catálogo real, 345 productos
└── src/
    ├── config/
    │   └── db.js           # connectDB() / disconnectDB(), reutilizable
    ├── models/
    │   └── Producto.js      # schema con enums, soft delete, virtual stockBajo
    ├── scripts/
    │   ├── normalizar.js     # inferirUnidad, inferirCategoria, resolverClave
    │   └── seed.js           # CSV -> normalizar -> Mongo (upsert idempotente)
    ├── routes/               # vacío, Fase 2+
    ├── controllers/          # vacío, Fase 2+
    ├── middleware/           # vacío, Fase 3+
    └── index.js              # servidor Express, solo /health por ahora
```

Historial de commits (Git ya inicializado, repo en GitHub):
```
6bafa0b Setup inicial: estructura, dependencias, conexion a MongoDB
c16268b Modelo de Producto con Mongoose: schema, enums, soft delete
c2ae133 Reglas de normalizacion: categoria, unidad, resolucion de clave
498baef Script de seed: importa catalogo real a MongoDB con normalizacion
```

---

## Decisiones de diseño ya justificadas por Mario (no re-litigar, solo recordar)

1. **`categoria` y `unidad` como `enum`**: evita variantes por typo/mayúsculas
   que romperían agregaciones y reportes (Fase 4).
2. **`clave` con `trim: true, uppercase: true`**: para que `unique: true`
   realmente detecte duplicados aunque varíe el formato de captura.
3. **Soft delete (`activo: false`) en vez de `deleteOne()`**: trazabilidad
   de inventario histórico, integridad referencial con futuras colecciones
   de ventas/movimientos, reversibilidad.
4. **`unidad: 'pieza'` como default**, no `'otro'`: confirmado contra los
   345 productos reales — la mayoría de artículos sin prefijo de unidad
   (conexiones, tubería, EPP) sí se venden por pieza.
5. **`electrico` se evalúa antes que `cemento_y_agregados`** en
   `inferirCategoria`: resuelve el caso `CABLE BLANCO CAL. 12` (donde
   "CAL." es abreviatura de calibre, no el material de construcción).
6. **Toda `SEÑALITICA` cae en `seguridad_industrial`**, incluida la de
   "riesgo eléctrico": decisión de negocio de Mario — en la práctica sigue
   siendo ante todo un letrero de prevención.
7. **El typo real del CSV (`SEÑALITICA`, no "señalética") se usa tal cual**
   en el matching — el código compara contra el dato real, no contra la
   ortografía correcta.
8. **`resolverClave` separa por `" / "` (con espacios)**, no por `"/"`
   solo — para no romper claves legítimas como `V1/2` o `M8/8` que usan
   `/` como parte del código, no como separador de alias.

## Bugs reales encontrados y resueltos (útiles para la narrativa de entrevista)

- **`\bCAL\b` vs `.includes('CAL')`**: sin límites de palabra, "CAL" hacía
  match dentro de "ESCALERA"/"ESCALERILLA". Se resolvió con regex de
  límite de palabra — y aun así, "CAL." (abreviatura de calibre en cables)
  seguía siendo un caso frontera que se resolvió con orden de reglas, no
  con el regex.
- **`rawResult`/`lastErrorObject.updatedExisting` ya no funciona** en
  mongoose@9 + mongodb driver@7: la opción fue renombrada
  (`includeResultMetadata`), así que el conteo de creados/actualizados
  siempre caía en "creados". Se diagnosticó con un `console.log` temporal
  del objeto crudo, y se resolvió sin depender de metadata específica de
  versión: se consulta `Producto.exists()` **antes** del upsert, en vez de
  interpretar la respuesta del upsert.
- **`dotenv@17.x` imprime "tips" promocionales en consola** (ej. mención a
  `vestauth.com`) — verificado con búsqueda web, es comportamiento real y
  oficial del paquete (el creador de dotenv promueve productos
  relacionados), no una dependencia comprometida. Se puede silenciar con
  `dotenv.config({ quiet: true })` si Mario lo prefiere; no es urgente.

## Resultado del seed (estado real de la base de datos local)

345 productos, 0 sin clave, 1 con alias de clave (`CAL007 / CALHIDRA`).
Distribución por categoría (última corrida confirmada):

```
otro                   158
plomeria_pvc            47
cemento_y_agregados     39
plomeria_cpvc           37
acero_y_malla           24
seguridad_industrial    12
block_y_tabique         12
herramienta              7
madera                   5
electrico                4
```

~54% cae en `otro` de momento — cifra más alta que el ~18% explorado en
una iteración previa del set de reglas (ver histórico si se retoma la
discusión); vale la pena revisar si conviene ampliar `REGLAS_CATEGORIA`
en una futura sesión, aunque no es bloqueante para la Fase 2.

---

## Siguiente paso inmediato: Fase 2

CRUD de Producto sin autenticación todavía:
- `src/routes/productoRoutes.js`
- `src/controllers/productoController.js`
- Middleware de manejo de errores centralizado (`src/middleware/errorHandler.js`)
- Validación ya la da Mongoose (schema), pero falta capturar y formatear
  esos errores de forma consistente en las respuestas HTTP.

Seguir el mismo método pedagógico: preguntas antes de código, Mario
escribe primero, Claude corrige con explicación, salvo que Mario pida
acelerar.
