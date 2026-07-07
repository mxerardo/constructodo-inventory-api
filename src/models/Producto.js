const mongoose = require('mongoose');

// Categorías derivadas de patrones reales observados en el catálogo de
// Constructodo (ver src/scripts/normalizar.js para las reglas de asignación).
const CATEGORIAS = [
  'plomeria_pvc',
  'plomeria_cpvc',
  'cemento_y_agregados',
  'block_y_tabique',
  'acero_y_malla',
  'electrico',
  'herramienta',
  'seguridad_industrial',
  'madera',
  'otro',
];

const UNIDADES = ['pieza', 'kg', 'm3', 'ml', 'bulto', 'otro'];

const productoSchema = new mongoose.Schema(
  {
    clave: {
      type: String,
      required: [true, 'La clave del producto es requerida'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción del producto es requerida'],
      trim: true,
    },
    categoria: {
      type: String,
      enum: {
        values: CATEGORIAS,
        message: 'Categoría "{VALUE}" no es válida',
      },
      required: [true, 'La categoría es requerida'],
      default: 'otro',
    },
    unidad: {
      type: String,
      enum: {
        values: UNIDADES,
        message: 'Unidad "{VALUE}" no es válida',
      },
      required: [true, 'La unidad es requerida'],
      default: 'pieza',
    },
    existencias: {
      type: Number,
      required: [true, 'Las existencias son requeridas'],
      min: [0, 'Las existencias no pueden ser negativas'],
      default: 0,
    },
    umbralMinimo: {
      type: Number,
      default: 5,
      min: [0, 'El umbral mínimo no puede ser negativo'],
    },
    activo: {
      type: Boolean,
      default: true, // soft delete: false = producto "eliminado" pero conservado
    },
  },
  {
    timestamps: true, // agrega createdAt / updatedAt automáticamente
  }
);

// Índices que soportan los patrones de búsqueda del plan: texto libre
// sobre descripcion, y filtrado combinado por categoria + activo.
productoSchema.index({ descripcion: 'text' });
productoSchema.index({ categoria: 1, activo: 1 });

// Virtual de conveniencia: ¿este producto está en stock bajo ahora mismo?
// No se guarda en la base de datos, se calcula al vuelo cada vez que se lee.
productoSchema.virtual('stockBajo').get(function stockBajo() {
  return this.existencias < this.umbralMinimo;
});

// Para que el virtual "stockBajo" aparezca cuando conviertes el documento
// a JSON (ej. al responder en una ruta de Express).
productoSchema.set('toJSON', { virtuals: true });

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;
module.exports.CATEGORIAS = CATEGORIAS;
module.exports.UNIDADES = UNIDADES;