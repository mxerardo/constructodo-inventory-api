/**
 * Reglas de normalización para el catálogo real de Constructodo.
 *
 * Se separan del script de seed (seed.js) para poder probarlas de forma
 * aislada con Jest sin necesitar una conexión a MongoDB, y porque son la
 * parte del proyecto con más criterio técnico que defender en entrevista:
 * decidir cómo inferir categoría/unidad a partir de texto libre y sucio.
 */

/**
 * Infiere la unidad de medida a partir del prefijo de la descripción.
 * La mayoría de los artículos del catálogo (conexiones, tubería,
 * herramienta, EPP) no traen prefijo de unidad porque se venden por
 * pieza -- ese es el default deliberado, no un valor genérico.
 */
function inferirUnidad(descripcion) {
    const texto = (descripcion || '').trim();
    if (texto.startsWith('KG')) return 'kg';
    else if (texto.startsWith('PZA')) return 'pieza';
    else if (texto.startsWith('BULTO')) return 'bulto';
    else if (texto.startsWith('ML') || texto.startsWith('MT')) return 'ml';
    else return 'pieza';
  }
  
  /**
   * Infiere la categoría a partir de palabras clave en la descripción.
   * El orden de las condiciones importa: se evalúa de arriba hacia abajo
   * y se detiene en la primera que haga match.
   */
  function inferirCategoria(descripcion) {
    const texto = (descripcion || '').trim();
  
    if (texto.includes('CPVC')) {
      return 'plomeria_cpvc';
    } else if (texto.includes('PVC')) {
      return 'plomeria_pvc';
    } else if (texto.includes('CABLE') || texto.includes('CONTACTO')) {
      // electrico va ANTES que cemento: "CABLE BLANCO CAL. 12" contiene
      // "CAL." (abreviatura de calibre), que se confundiría con la regla
      // de cemento si se evaluara primero.
      return 'electrico';
    } else if (
      /\bCAL\b/.test(texto) || // límite de palabra: evita falsos positivos como "ESCALERA"
      texto.includes('CEMENTO') ||
      texto.includes('MORTERO') ||
      texto.includes('YESO') ||
      texto.includes('ESTUCO') ||
      texto.includes('ARENA') ||
      texto.includes('GRAVA')
    ) {
      return 'cemento_y_agregados';
    } else if (texto.includes('BLOCK') || texto.includes('TABIQUE')) {
      return 'block_y_tabique';
    } else if (
      texto.includes('VARILLA') ||
      texto.includes('MALLA') ||
      texto.includes('ALAMBRE') ||
      texto.includes('CLAVO')
    ) {
      return 'acero_y_malla';
    } else if (
      texto.includes('CASCO') ||
      texto.includes('GUANTE') ||
      texto.includes('LENTE') ||
      texto.includes('CHALECO') ||
      texto.includes('SEÑALITICA') // typo real del CSV; toda señalítica cae aquí, incluida la de riesgo eléctrico
    ) {
      return 'seguridad_industrial';
    } else if (
      texto.includes('MADERA') ||
      texto.includes('TRIPLAY') ||
      texto.includes('DUELA') ||
      texto.includes('POLIN')
    ) {
      return 'madera';
    } else if (texto.includes('DISCO') || texto.includes('SEGUETA')) {
      return 'herramienta';
    } else {
      return 'otro';
    }
  }
  
  /**
   * Resuelve claves duplicadas del mismo producto, como
   * "CAL007 / CALHIDRA" en el catálogo real: dos identificadores separados
   * por " / " para un solo artículo (a diferencia de algo como "M8/8", que
   * es parte del propio código y no lleva espacios alrededor del slash).
   *
   * Regla adoptada: se usa el primer segmento como clave canónica en Mongo,
   * y se conserva el segundo como alias informativo.
   */
  function resolverClave(claveCruda) {
    const partes = (claveCruda || '')
      .split(' / ')
      .map((p) => p.trim())
      .filter(Boolean);
  
    const clave = (partes[0] || claveCruda || '').trim();
    const aliasClave = partes.length > 1 ? partes[1] : null;
  
    return { clave, aliasClave };
  }
  
  module.exports = { inferirUnidad, inferirCategoria, resolverClave };