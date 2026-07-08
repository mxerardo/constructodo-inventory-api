// src/routes/productoRoutes.js

const express = require('express');
const productoController = require('../controllers/productoController');

const router = express.Router();

// GET /api/productos -> lista todos los productos
router.get('/', productoController.listarProductos);

// GET /api/productos/:id -> obtiene un producto por su id
router.get('/:id', productoController.obtenerProducto);

// POST /api/productos -> crea un producto nuevo
router.post('/', productoController.crearProducto);

// PUT /api/productos/:id -> actualiza un producto existente
router.put('/:id', productoController.actualizarProducto);

// DELETE /api/productos/:id -> soft delete de un producto
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;