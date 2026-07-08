// src/utils/AppError.js

// Clase de error personalizada que extiende el Error nativo de JS.
// Además del mensaje, carga un statusCode HTTP para que errorHandler.js
// no tenga que adivinar qué código regresar según el texto del mensaje.
class AppError extends Error {
    constructor(mensaje, statusCode) {
      super(mensaje); // le pasa el mensaje al constructor de Error normal
      this.statusCode = statusCode;
      this.name = this.constructor.name; // 'AppError' o el nombre de la subclase
    }
  }
  
  module.exports = AppError;