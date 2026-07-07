const mongoose = require('mongoose');

/**
 * Conecta a MongoDB usando la URI definida en las variables de entorno.
 * Se separa en su propio módulo para poder reutilizarla tanto en el
 * servidor (src/index.js) como en scripts standalone (src/scripts/seed.js) —
 * ambos necesitan conectarse a Mongo, pero no queremos duplicar esta lógica.
 *
 * @param {string} uri - URI de conexión. Por defecto toma MONGO_URI del .env,
 *                        pero se puede pasar otra (ej. en tests futuros).
 */
async function connectDB(uri = process.env.MONGO_URI) {
  // Fallamos rápido y con un mensaje claro si falta la URI, en vez de dejar
  // que Mongoose intente conectar a "undefined" y tire un error confuso.
  if (!uri) {
    throw new Error(
      'MONGO_URI no está definida. Revisa tu archivo .env'
    );
  }

  // Listener de eventos: Mongoose emite 'error' si la conexión falla DESPUÉS
  // de haberse establecido (ej. Mongo se cae mientras el servidor ya corría).
  // Sin este listener, ese error no se manejaría de forma explícita.
  mongoose.connection.on('error', (err) => {
    console.error('Error de conexión a MongoDB:', err.message);
  });

  // mongoose.connect() devuelve una promesa; esperamos a que la conexión
  // quede establecida antes de continuar (por eso el await).
  await mongoose.connect(uri);
  console.log(`MongoDB conectado -> ${mongoose.connection.name}`);

  return mongoose.connection;
}

/**
 * Cierra la conexión activa a MongoDB.
 * Útil para scripts que deben terminar limpio (ej. seed.js: conecta,
 * importa datos, se desconecta y termina el proceso) y para tests que
 * necesitan cerrar la conexión al final de la suite.
 */
async function disconnectDB() {
  await mongoose.disconnect();
}

// Exportamos ambas funciones para usarlas donde se necesiten.
module.exports = { connectDB, disconnectDB };