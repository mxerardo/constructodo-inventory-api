// src/middleware/errorHandler.js

// Middleware de manejo de errores. Express lo reconoce como "especial"
// porque tiene 4 parámetros (error, req, res, next) en vez de 3 —
// esa firma es la señal que Express usa para saber que este middleware
// solo se ejecuta cuando alguien llama a next(error), no en cada request normal.
function errorHandler(error, req, res, next) {
    // Si el error viene de nuestra clase AppError, ya trae su propio
    // statusCode (404, 400, etc.). Si no —por ejemplo un error nativo de
    // Mongoose o un bug inesperado— no tiene statusCode, así que usamos
    // 500 (Internal Server Error) como default.
    let statusCode = error.statusCode || 500;
    let mensaje = error.message || 'Error interno del servidor';
  
    // Caso especial: errores de validación de Mongoose (ej. un enum
    // inválido, un required faltante) tienen error.name === 'ValidationError'
    // y no traen statusCode propio. Los traducimos aquí a 400 (Bad Request),
    // que es el código correcto para "el cliente mandó datos inválidos".
    if (error.name === 'ValidationError') {
      statusCode = 400;
    }
  
    // Caso especial: error de Mongoose al intentar convertir un string
    // inválido a ObjectId (ej. alguien manda /api/productos/abc123 en vez
    // de un id real de Mongo). Sin este caso, ese error también caería
    // como 500, cuando en realidad es un error del cliente (400).
    if (error.name === 'CastError') {
      statusCode = 400;
      mensaje = `Id inválido: ${error.value}`;
    }
  
    // Solo mostramos el detalle completo del error en consola si es un
    // 500 real (algo inesperado) — para 400/404, que son "normales" del
    // día a día de una API, no ensuciamos los logs.
    if (statusCode === 500) {
      console.error(error);
    }
  
    res.status(statusCode).json({ error: mensaje });
  }
  
  module.exports = errorHandler;