// ============================================================
// exportarVisitasRTF.js
// Exporta las visitas medicas (consultas, analisis, otras) a RTF
// ============================================================

/**
 * Exporta los datos de una pestana a un archivo RTF descargable.
 *
 * @param {string} tipo - 'consulta' | 'analisis' | 'otras'
 * @param {array} lista - Array con los datos a exportar
 */
export function exportarVisitasRTF(tipo, lista) {
  if (!lista || lista.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  // ============ CONFIGURACION POR TIPO ============
  var config = {
    consulta: {
      titulo: 'Consultas Medicas',
      headers: ['Fecha', 'Medico', 'Especialidad', 'Observaciones'],
      fields: ['fecha', 'medico', 'especialidad', 'observaciones'],
      anchos: [1500, 3000, 2500, 5000]
    },
    analisis: {
      titulo: 'Analisis de Sangre y Estudios',
      headers: ['Fecha', 'Edad', 'Pais', 'Colest.', 'HDL', 'LDL', 'Triglic.', 'Creat.', 'Gluc.', 'Sodio', 'Potasio', 'PSA'],
      fields: ['fecha', 'edad', 'pais', 'colesterol_total', 'hdl_bueno', 'ldl_malo', 'trigliceridos', 'creatinina', 'glucosa', 'sodio', 'potasio', 'psa'],
      anchos: [1000, 600, 1200, 800, 700, 700, 800, 700, 700, 700, 800, 700]
    },
    otras: {
      titulo: 'Otras Consultas',
      headers: ['Fecha', 'Tipo', 'Profesional', 'Observaciones'],
      fields: ['fecha', 'especialidad', 'medico', 'observaciones'],
      anchos: [1500, 2500, 3000, 5000]
    }
  };

  var cfg = config[tipo];
  if (!cfg) {
    alert('Tipo de exportacion no valido.');
    return;
  }

  // ============ GENERAR RTF ============
  var rtf = generarRTFVisitas(tipo, cfg, lista);

  // ============ DESCARGAR ============
  var fecha = new Date().toISOString().split('T')[0];
  var nombreArchivo = 'IPS_' + tipo.charAt(0).toUpperCase() + tipo.slice(1) + '_' + fecha + '.rtf';

  var blob = new Blob([rtf], { type: 'application/rtf' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Genera el contenido RTF.
 */
function generarRTFVisitas(tipo, cfg, lista) {
  var nl = '\r\n';
  var r = '';

  // Escapar caracteres especiales
  function esc(s) {
    s = String(s == null ? '' : s);
    var res = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c === 92)       res += '\\\\';
      else if (c === 123) res += '\\{';
      else if (c === 125) res += '\\}';
      else if (c === 10)  res += '\\line ';
      else if (c === 13)  res += '';
      else if (c > 127)   res += '\\u' + c + '?';
      else                res += s[i];
    }
    return res;
  }

  // Cabecera RTF
  r += '{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang3082' + nl;
  r += '{\\fonttbl{\\f0 Calibri;}{\\f1 Consolas;}}' + nl;
  r += '{\\colortbl ;' + nl;
  r += '\\red46\\green125\\blue50;' + nl;      // 1 = verde oscuro
  r += '\\red100\\green100\\blue100;' + nl;    // 2 = gris
  r += '\\red255\\green255\\blue255;' + nl;    // 3 = blanco
  r += '\\red46\\green125\\blue50;' + nl;      // 4 = verde cabecera
  r += '\\red230\\green245\\blue230;' + nl;    // 5 = verde claro (fondo alternado)
  r += '\\red180\\green180\\blue180;' + nl;    // 6 = gris claro (bordes)
  r += '}' + nl;
  r += '\\paperw12240\\paperh15840\\margl720\\margr720\\margt720\\margb720' + nl;
  r += '\\f0\\fs22' + nl;

  // ============ PORTADA ============
  var fecha = new Date().toLocaleString('es-ES');
  r += '\\pard\\qc\\b\\fs40\\cf1 IPS Control\\b0\\fs22\\cf0\\par' + nl;
  r += '\\pard\\qc\\cf2 ' + esc(cfg.titulo) + '\\cf0\\par' + nl;
  r += '\\pard\\qc\\cf2 Generado: ' + esc(fecha) + '\\cf0\\par' + nl;
  r += '\\pard\\qc\\cf2 Total de registros: ' + esc(String(lista.length)) + '\\cf0\\par' + nl;
  r += '\\pard\\par' + nl;

  // ============ TABLA DE DATOS ============
  var borde = '\\clbrdrt\\brdrs\\brdrw10\\brdrcf6\\clbrdrl\\brdrs\\brdrw10\\brdrcf6\\clbrdrb\\brdrs\\brdrw10\\brdrcf6\\clbrdrr\\brdrs\\brdrw10\\brdrcf6';

  // Calcular los cellx acumulados
  var anchosAcum = [];
  var acumulado = 0;
  cfg.anchos.forEach(function(w) {
    acumulado += w;
    anchosAcum.push(acumulado);
  });

  // Header
  r += '\\trowd\\trgaph70\\trleft0\\trhdr';
  anchosAcum.forEach(function(x) {
    r += borde + '\\clcbpat4\\cellx' + x;
  });
  r += nl;
  cfg.headers.forEach(function(h) {
    r += '\\pard\\intbl\\b\\cf3 ' + esc(h) + '\\b0\\cf0\\cell ';
  });
  r += '\\row' + nl;

  // Filas
  lista.forEach(function(item, idx) {
    var fondo = (idx % 2 === 1) ? '\\clcbpat5' : '';

    r += '\\trowd\\trgaph70\\trleft0';
    anchosAcum.forEach(function(x) {
      r += borde + fondo + '\\cellx' + x;
    });
    r += nl;

    cfg.fields.forEach(function(f) {
      var valor = item[f];
      if (valor === null || valor === undefined) valor = '';
      r += '\\pard\\intbl ' + esc(valor) + '\\cell ';
    });
    r += '\\row' + nl;
  });

  r += '\\pard\\par' + nl;

  // ============ PIE ============
  r += '\\pard\\qc\\cf2 --- Fin del reporte ---\\cf0\\par' + nl;

  r += '}' + nl;
  return r;
}
