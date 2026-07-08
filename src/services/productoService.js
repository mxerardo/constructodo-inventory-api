// src/services/productoService.js

const Producto = require('../models/Producto');
const AppError = require('../utils/AppError');

// Lista productos, aceptando filtros opcionales desde query params.
// Solo regresa productos activos (activo: true) — el soft delete los excluye.
// Los filtros (categoria, q, stockBajo) se arman como un objeto para Mongoose.
async function listarProductos(filtros = {}) {
  const query = { activo: true };

  if (filtros.categoria) {
    query.categoria = filtros.categoria;
  }

  if (filtros.q) {
    query.descripcion = { $regex: filtros.q, $options: 'i' };
  }

  return await Producto.find(query);
}

// Busca un producto por id; si no existe (o no está activo), lanza 404.
// findById regresa null si no encuentra nada, por eso el chequeo explícito.
// El error se lanza aquí, no en el controlador, para mantenerlo delgado.
async function obtenerProductoPorId(id) {
  const producto = await Producto.findById(id);

  if (!producto || !producto.activo) {
    throw new AppError('Producto no encontrado', 404);
  }

  return producto;
}

// Crea un producto nuevo a partir de los datos ya validados por Mongoose.
// Si el schema rechaza los datos (ej. falta un required), Mongoose ya
// lanza su propio error, que sube tal cual hasta errorHandler.js.
async function crearProducto(datos) {
  const nuevoProducto = await Producto.create(datos);
  return nuevoProducto;
}

// Actualiza un producto existente, validando que exista antes de intentarlo.
// { new: true } hace que Mongoose regrese el documento YA actualizado.
// { runValidators: true } asegura que las reglas del schema apliquen también en updates.
async function actualizarProducto(id, cambios) {
  const productoActualizado = await Producto.findByIdAndUpdate(id, cambios, {
    new: true,
    runValidators: true,
  });

  if (!productoActualizado || !productoActualizado.activo) {
    throw new AppError('Producto no encontrado', 404);
  }

  return productoActualizado;
}

// "Elimina" un producto marcándolo como inactivo, nunca lo borra de Mongo.
// Reutiliza el mismo patrón de findByIdAndUpdate que actualizarProducto.
// Si ya estaba inactivo, lo tratamos igual que "no encontrado" (regla de negocio a confirmar).
async function eliminarProducto(id) {
  const productoEliminado = await Producto.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );

  if (!productoEliminado) {
    throw new AppError('Producto no encontrado', 404);
  }

  return productoEliminado;
}

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};