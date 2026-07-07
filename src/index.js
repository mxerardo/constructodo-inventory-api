// dotenv.config() debe ir ANTES de cualquier otro require que use
// process.env (como db.js), para que las variables ya estén cargadas
// cuando esos módulos se ejecuten.
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');

const app = express();

// Middlewares globales: se ejecutan en TODA petición, antes de llegar
// a cualquier ruta.
app.use(cors());         // permite requests desde otros orígenes/dominios
app.use(express.json());  // parsea el body de requests como JSON automáticamente

// Ruta de healthcheck: confirma que el servidor está vivo y respondiendo.
// Las rutas reales de /api/productos, /api/auth, etc. se agregan a partir
// de la Fase 2 (CRUD) y Fase 3 (auth).
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'constructodo-inventory-api' });
});

const PORT = process.env.PORT || 3000;

// Función async porque connectDB() usa await internamente (conectar a
// Mongo es una operación asíncrona: toma tiempo, no es instantánea).
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

// Solo arrancamos el servidor si este archivo se ejecuta directamente
// (ej. "node src/index.js"), no si algún día se importa desde un test.
if (require.main === module) {
  start().catch((err) => {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  });
}

module.exports = app;