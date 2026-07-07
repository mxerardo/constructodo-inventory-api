/**
 * Script de importación (seed) del catálogo real de Constructodo.
 *
 * Uso: npm run seed
 * Lee el CSV definido en SEED_CSV_PATH (.env), normaliza cada renglón
 * (categoría, unidad, clave) y hace upsert en MongoDB para que el script
 * se pueda correr varias veces sin duplicar productos.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const { connectDB, disconnectDB } = require('../config/db');
const Producto = require('../models/Producto');
const { inferirUnidad, inferirCategoria, resolverClave } = require('./normalizar');

const CSV_PATH = path.resolve(
  process.cwd(),
  process.env.SEED_CSV_PATH || './data/INVENTARIO_DE_TOTALES.csv'
);

/**
 * Convierte un renglón crudo del CSV (Clave, Descripción, EXISTENCIAS
 * GENERALES) al shape del modelo Producto, aplicando las reglas de
 * normalización.
 */
function transformarRenglon(renglon) {
  // Los headers reales del CSV traen un espacio antes de "Descripción"
  // (" Descripción"), por eso se accede de forma tolerante, revisando
  // varias posibles llaves en vez de asumir un solo nombre exacto.
  const claveCruda = renglon['Clave'] ?? renglon['clave'];
  const descripcionCruda =
    renglon[' Descripción'] ?? renglon['Descripción'] ?? renglon['descripcion'];
  const existenciasCrudas =
    renglon['EXISTENCIAS GENERALES'] ?? renglon['existencias'] ?? '0';

  const descripcion = (descripcionCruda || '').trim();
  const { clave, aliasClave } = resolverClave(claveCruda);
  const existencias = Number.parseFloat(existenciasCrudas);

  return {
    clave,
    aliasClave, // no se guarda en el modelo, solo se usa para el log de importación
    descripcion,
    categoria: inferirCategoria(descripcion),
    unidad: inferirUnidad(descripcion),
    existencias: Number.isFinite(existencias) ? existencias : 0,
  };
}

async function seed() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(
      `No se encontró el CSV en ${CSV_PATH}. Ajusta SEED_CSV_PATH en tu .env.`
    );
  }

  const contenido = fs.readFileSync(CSV_PATH, { encoding: 'utf-8' });
  const renglones = parse(contenido, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Leyendo ${renglones.length} renglones de ${CSV_PATH}...`);

  await connectDB();

  let creados = 0;
  let actualizados = 0;
  let conAlias = 0;
  const categoriasContadas = {};

  for (const renglon of renglones) {
    const producto = transformarRenglon(renglon);

    if (!producto.clave) {
      console.warn(`  Renglón sin clave omitido: "${producto.descripcion}"`);
      continue;
    }
    if (producto.aliasClave) conAlias += 1;

    // Separamos aliasClave (no forma parte del schema de Producto) del
    // resto de campos que sí se guardan en Mongo.
    const { aliasClave, ...datosProducto } = producto;

    // Verificamos existencia ANTES del upsert, en vez de interpretar metadata
    // del resultado (esa metadata depende de la versión exacta del driver de
    // Mongo, y ya vimos que cambia entre versiones -- esto es más estable).
    const existiaAntes = await Producto.exists({ clave: datosProducto.clave });

    await Producto.findOneAndUpdate(
      { clave: datosProducto.clave },
      { $set: datosProducto },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    if (existiaAntes) {
      actualizados += 1;
    } else {
      creados += 1;
    }

    categoriasContadas[datosProducto.categoria] =
      (categoriasContadas[datosProducto.categoria] || 0) + 1;
  }

  console.log('\nResumen de importación');
  console.log('-----------------------');
  console.log(`Creados:      ${creados}`);
  console.log(`Actualizados: ${actualizados}`);
  console.log(`Con alias de clave: ${conAlias}`);
  console.log('\nProductos por categoría:');
  for (const [categoria, total] of Object.entries(categoriasContadas).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${categoria.padEnd(22)} ${total}`);
  }

  await disconnectDB();
}

// Solo ejecuta seed() si este archivo se corre directamente (npm run seed),
// no si algún día se importa desde un test.
if (require.main === module) {
  seed()
    .then(() => {
      console.log('\nSeed completado.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\nError durante el seed:', err.message);
      process.exit(1);
    });
}

module.exports = { transformarRenglon, seed };