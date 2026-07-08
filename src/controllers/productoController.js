// src/controllers/productoController.js

const productoService = require('../services/productoService');

// GET /api/productos
// Lee los filtros opcionales de la URL (query params) y se los pasa al service.
// El service regresa la lista ya filtrada; aquí solo la mandamos como JSON.
async function listarProductos(req, res, next) {
  try {
    const productos = await productoService.listarProductos(req.query);
    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
}

// GET /api/productos/:id
// Toma el id de req.params y le pide al service el producto correspondiente.
// Si el service lanza un error "no encontrado", errorHandler lo atrapa después.
async function obtenerProducto(req, res, next) {
  try {
    const producto = await productoService.obtenerProductoPorId(req.params.id);
    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
}

// POST /api/productos
// Toma los datos del nuevo producto desde req.body y los pasa al service.
// Responde 201 (creado) con el producto ya guardado en MongoDB.
async function crearProducto(req, res, next) {
  try {
    const nuevoProducto = await productoService.crearProducto(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    next(error);
  }
}

// PUT /api/productos/:id
// Combina el id de req.params con los cambios de req.body.
// El service se encarga de validar y aplicar la actualización en Mongo.
async function actualizarProducto(req, res, next) {
  try {
    const productoActualizado = await productoService.actualizarProducto(
      req.params.id,
      req.body
    );
    res.status(200).json(productoActualizado);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/productos/:id
// Pide al service el soft delete (activo: false), no un borrado real.
// Responde 200 con el producto ya marcado como inactivo (o 204 sin body, a elegir).
async function eliminarProducto(req, res, next) {
  try {
    const productoEliminado = await productoService.eliminarProducto(req.params.id);
    res.status(200).json(productoEliminado);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};