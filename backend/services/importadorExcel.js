import path from 'node:path';
import XLSX from 'xlsx';
import Empleado from '../models/Empleado.js';
import LineaCorporativa from '../models/LineaCorporativa.js';
import HistorialMovimiento from '../models/HistorialMovimiento.js';
import { CANALES, OPERADORES, TIPOS_DOCUMENTO } from '../utils/enums.js';

const CANAL_POR_DEFECTO = 'SIN CANAL';
const VALORES_VACIOS = new Set(['', '#N/A', 'N/A', '-', 'NO APLICA']);

function texto(valor) {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) return valor.toISOString();
  return String(valor).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function textoOpcional(valor) {
  const limpio = texto(valor);
  if (VALORES_VACIOS.has(limpio.toUpperCase())) return '';
  return limpio;
}

function recortar(valor, maximo) {
  const limpio = textoOpcional(valor);
  return limpio.slice(0, maximo);
}

function normalizarDocumento(valor) {
  if (typeof valor === 'number' && Number.isFinite(valor)) {
    return Number.isInteger(valor) ? String(valor) : String(valor).replace(/\.0+$/, '');
  }
  return textoOpcional(valor).replace(/\.0+$/, '');
}

function normalizarTipoDocumento(valor) {
  const limpio = texto(valor).toUpperCase();
  return TIPOS_DOCUMENTO.includes(limpio) ? limpio : 'CC';
}

function normalizarCanal(valor, advertencias, contexto) {
  const limpio = texto(valor).toUpperCase();
  if (VALORES_VACIOS.has(limpio)) return '';
  if (CANALES.includes(limpio)) return limpio;
  advertencias.push(`Canal no reconocido "${limpio}" en ${contexto}; se usará ${CANAL_POR_DEFECTO}.`);
  return CANAL_POR_DEFECTO;
}

function normalizarCanalObligatorio(valor, advertencias, contexto) {
  return normalizarCanal(valor, advertencias, contexto) || CANAL_POR_DEFECTO;
}

function parsearFecha(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor;

  if (typeof valor === 'number') {
    const partes = XLSX.SSF.parse_date_code(valor);
    if (!partes) return null;
    return new Date(Date.UTC(partes.y, partes.m - 1, partes.d));
  }

  const limpio = texto(valor);
  if (!limpio || VALORES_VACIOS.has(limpio.toUpperCase())) return null;

  const fecha = new Date(limpio);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function resolverNombreEmpleado(documento, nombre, canal) {
  const limpio = textoOpcional(nombre);
  const nombreMayusculas = limpio.toUpperCase();
  const canalMayusculas = texto(canal).toUpperCase();

  if (
    limpio &&
    nombreMayusculas !== 'GERENCIA' &&
    nombreMayusculas !== canalMayusculas &&
    !CANALES.includes(nombreMayusculas)
  ) {
    return limpio;
  }

  if (documento && !/^\d+$/.test(documento)) return documento;
  return limpio || documento;
}

function leerFilas(workbook, nombreHoja) {
  const hoja = workbook.Sheets[nombreHoja];
  if (!hoja) throw new Error(`No se encontró la hoja "${nombreHoja}" en el archivo Excel`);
  return XLSX.utils.sheet_to_json(hoja, {
    header: 1,
    defval: null,
    raw: true,
    blankrows: false
  });
}

function empleadoDesdeActivo(fila, advertencias, indice) {
  const documento = normalizarDocumento(fila[0]);
  const nombresApellidos = recortar(fila[2], 150);

  if (!documento || !nombresApellidos) {
    advertencias.push(`Fila ${indice} de ACTIVO omitida: documento o nombre vacío.`);
    return null;
  }

  const fechaIngreso = parsearFecha(fila[9]) || parsearFecha(fila[8]);
  const fechaRetiro = parsearFecha(fila[10]);

  return {
    documento,
    tipoDocumento: normalizarTipoDocumento(fila[1]),
    nombresApellidos,
    canal: normalizarCanalObligatorio(fila[4], advertencias, `ACTIVO fila ${indice}`),
    puntoVenta: recortar(fila[6], 120),
    ciudad: recortar(fila[7], 80),
    cargo: recortar(fila[19], 120),
    estadoLaboral: fechaRetiro ? 'RETIRADO' : 'ACTIVO',
    fechaIngreso,
    fechaRetiro
  };
}

function leerCancelables(workbook) {
  const cancelables = new Map();

  for (const nombreHoja of ['CLARO CANCELAR', 'TIGO CANCELAR']) {
    const filas = leerFilas(workbook, nombreHoja).slice(1);
    const operadorHoja = nombreHoja.startsWith('CLARO') ? 'CLARO' : 'TIGO';

    for (const fila of filas) {
      const movil = normalizarDocumento(fila[0]);
      if (!/^\d{10}$/.test(movil)) continue;

      const operador = texto(fila[1]).toUpperCase();
      cancelables.set(movil, OPERADORES.includes(operador) ? operador : operadorHoja);
    }
  }

  return cancelables;
}

function leerGerencia(workbook, advertencias) {
  const filas = leerFilas(workbook, 'GERENCIA');
  const gerencia = new Map();

  for (const [indice, fila] of filas.entries()) {
    const movil = normalizarDocumento(fila[0]);
    if (!/^\d{10}$/.test(movil)) continue;

    gerencia.set(movil, {
      movil,
      empleadoDocumento: normalizarDocumento(fila[8]),
      empleadoNombre: textoOpcional(fila[9]),
      puntoVenta: recortar(fila[10], 120),
      ciudad: recortar(fila[11], 80),
      canal: normalizarCanal(fila[12], advertencias, `GERENCIA fila ${indice + 1}`)
    });
  }

  return gerencia;
}

function lineaDesdeFila(fila, cancelables, advertencias, indice) {
  const movil = normalizarDocumento(fila[1]);

  if (!/^\d{10}$/.test(movil)) {
    advertencias.push(`Fila ${indice} de LINEAS CORPORATIVAS omitida: móvil inválido.`);
    return null;
  }

  const operador = texto(fila[14]).toUpperCase();
  if (!OPERADORES.includes(operador)) {
    advertencias.push(`Fila ${indice} de LINEAS CORPORATIVAS omitida: operador "${operador}" inválido.`);
    return null;
  }

  const comentario = textoOpcional(fila[15]);
  const cancelar = cancelables.has(movil) || comentario.toUpperCase() === 'CANCELAR';

  return {
    movil,
    operador,
    canalLinea: normalizarCanal(fila[13], advertencias, `LINEAS CORPORATIVAS fila ${indice}`),
    empleadoDocumento: normalizarDocumento(fila[9]),
    empleadoNombre: textoOpcional(fila[10]),
    puntoVenta: recortar(fila[11], 120),
    ciudad: recortar(fila[12], 80),
    custCode: recortar(fila[7], 60),
    ciclo: recortar(fila[8], 60),
    comentario: recortar(cancelar && !comentario ? 'CANCELAR' : comentario, 500),
    cancelar
  };
}

export async function importarExcel(rutaArchivo, { reemplazar = false } = {}) {
  const ruta = path.resolve(rutaArchivo);
  const workbook = XLSX.readFile(ruta, { cellDates: true });
  const advertencias = [];
  const empleados = new Map();
  const lineas = new Map();

  const filasActivo = leerFilas(workbook, 'ACTIVO').slice(1);
  let empleadosActivo = 0;

  for (const [indice, fila] of filasActivo.entries()) {
    const empleado = empleadoDesdeActivo(fila, advertencias, indice + 2);
    if (!empleado) continue;

    if (empleados.has(empleado.documento)) {
      advertencias.push(`Documento duplicado en ACTIVO: ${empleado.documento}. Se conserva el primer registro.`);
      continue;
    }

    empleados.set(empleado.documento, empleado);
    empleadosActivo += 1;
  }

  const cancelables = leerCancelables(workbook);
  const gerencia = leerGerencia(workbook, advertencias);
  const filasLineas = leerFilas(workbook, 'LINEAS CORPORATIVAS').slice(1);

  for (const [indice, fila] of filasLineas.entries()) {
    const linea = lineaDesdeFila(fila, cancelables, advertencias, indice + 2);
    if (!linea) continue;

    if (lineas.has(linea.movil)) {
      advertencias.push(`Móvil duplicado en LINEAS CORPORATIVAS: ${linea.movil}. Se conserva el primer registro.`);
      continue;
    }

    lineas.set(linea.movil, linea);
  }

  for (const linea of lineas.values()) {
    const datosGerencia = gerencia.get(linea.movil);
    if (!datosGerencia) continue;

    linea.empleadoDocumento ||= datosGerencia.empleadoDocumento;
    linea.empleadoNombre ||= datosGerencia.empleadoNombre;
    linea.puntoVenta ||= datosGerencia.puntoVenta;
    linea.ciudad ||= datosGerencia.ciudad;
    linea.canalLinea ||= datosGerencia.canal;
  }

  for (const [movil, datosGerencia] of gerencia) {
    if (lineas.has(movil)) continue;

    lineas.set(movil, {
      movil,
      operador: cancelables.get(movil) || 'CLARO',
      canalLinea: datosGerencia.canal,
      empleadoDocumento: datosGerencia.empleadoDocumento,
      empleadoNombre: datosGerencia.empleadoNombre,
      puntoVenta: datosGerencia.puntoVenta,
      ciudad: datosGerencia.ciudad,
      custCode: '',
      ciclo: '',
      comentario: cancelables.has(movil) ? 'CANCELAR' : '',
      cancelar: cancelables.has(movil)
    });
  }

  for (const [movil, operador] of cancelables) {
    if (lineas.has(movil)) continue;

    lineas.set(movil, {
      movil,
      operador,
      canalLinea: '',
      empleadoDocumento: '',
      empleadoNombre: '',
      puntoVenta: '',
      ciudad: '',
      custCode: '',
      ciclo: '',
      comentario: 'CANCELAR',
      cancelar: true
    });
  }

  let empleadosExtra = 0;

  for (const linea of lineas.values()) {
    const documento = linea.empleadoDocumento;
    if (!documento || empleados.has(documento)) continue;

    const nombresApellidos = resolverNombreEmpleado(documento, linea.empleadoNombre, linea.canalLinea);
    if (!nombresApellidos) {
      advertencias.push(`No se pudo crear el empleado ${documento}: nombre vacío.`);
      continue;
    }

    empleados.set(documento, {
      documento,
      tipoDocumento: 'CC',
      nombresApellidos: recortar(nombresApellidos, 150),
      canal: linea.canalLinea || CANAL_POR_DEFECTO,
      puntoVenta: linea.puntoVenta,
      ciudad: linea.ciudad,
      cargo: '',
      estadoLaboral: 'ACTIVO',
      fechaIngreso: null,
      fechaRetiro: null
    });
    empleadosExtra += 1;
  }

  const empleadosArray = [...empleados.values()];
  const documentos = empleadosArray.map(({ documento }) => documento);

  if (reemplazar) {
    await HistorialMovimiento.deleteMany({});
    await LineaCorporativa.deleteMany({});
    await Empleado.deleteMany({});
    await Empleado.insertMany(empleadosArray, { ordered: false });
  } else {
    await Empleado.bulkWrite(
      empleadosArray.map((empleado) => ({
        updateOne: {
          filter: { documento: empleado.documento },
          update: { $set: empleado },
          upsert: true
        }
      })),
      { ordered: false }
    );
  }

  const empleadosGuardados = await Empleado.find({ documento: { $in: documentos } })
    .select('_id documento estadoLaboral canal')
    .lean();
  const empleadosPorDocumento = new Map(
    empleadosGuardados.map((empleado) => [empleado.documento, empleado])
  );

  const lineasArray = [...lineas.values()].map((linea) => {
    const empleado = linea.empleadoDocumento ? empleadosPorDocumento.get(linea.empleadoDocumento) : null;
    return {
      movil: linea.movil,
      operador: linea.operador,
      estadoLinea: linea.cancelar ? 'POR_CANCELAR' : empleado ? 'ACTIVA' : 'DISPONIBLE',
      canalAsignado: linea.canalLinea || empleado?.canal || CANAL_POR_DEFECTO,
      empleadoAsignado: empleado?._id || null,
      custCode: linea.custCode,
      ciclo: linea.ciclo,
      comentario: linea.comentario
    };
  });
  const moviles = lineasArray.map(({ movil }) => movil);

  if (reemplazar) {
    await LineaCorporativa.insertMany(lineasArray, { ordered: false });
  } else {
    await LineaCorporativa.bulkWrite(
      lineasArray.map((linea) => ({
        updateOne: {
          filter: { movil: linea.movil },
          update: { $set: linea },
          upsert: true
        }
      })),
      { ordered: false }
    );
  }

  const lineasGuardadas = await LineaCorporativa.find({ movil: { $in: moviles } })
    .select('_id movil empleadoAsignado estadoLinea')
    .lean();
  const lineasPorMovil = new Map(lineasGuardadas.map((linea) => [linea.movil, linea]));

  const fechaImportacion = new Date();
  const movimientos = [];

  for (const linea of lineasGuardadas) {
    if (linea.empleadoAsignado) {
      movimientos.push({
        linea: linea._id,
        empleadoAnterior: null,
        empleadoNuevo: linea.empleadoAsignado,
        tipoMovimiento: 'ASIGNACION',
        observacion: 'Carga inicial desde Excel',
        fechaMovimiento: fechaImportacion
      });
    }

    if (linea.estadoLinea === 'POR_CANCELAR') {
      movimientos.push({
        linea: linea._id,
        empleadoAnterior: linea.empleadoAsignado || null,
        empleadoNuevo: linea.empleadoAsignado || null,
        tipoMovimiento: 'MARCADA_CANCELAR',
        observacion: 'Línea marcada para cancelar según Excel',
        fechaMovimiento: new Date(fechaImportacion.getTime() + 1000)
      });
    }
  }

  if (reemplazar) {
    await HistorialMovimiento.insertMany(movimientos, { ordered: false });
  } else {
    const idsLineas = lineasGuardadas.map(({ _id }) => _id);
    await HistorialMovimiento.deleteMany({ linea: { $in: idsLineas } });
    await HistorialMovimiento.insertMany(movimientos, { ordered: false });
  }

  const estadosLinea = lineasArray.reduce(
    (conteo, linea) => {
      conteo[linea.estadoLinea] += 1;
      return conteo;
    },
    { ACTIVA: 0, DISPONIBLE: 0, POR_CANCELAR: 0, CANCELADA: 0 }
  );

  const empleadosRetirados = new Set(
    empleadosArray.filter(({ estadoLaboral }) => estadoLaboral === 'RETIRADO').map(({ documento }) => documento)
  );

  const alertasRetiradosConLinea = lineasArray.filter(({ empleadoAsignado }) => {
    if (!empleadoAsignado) return false;
    const empleado = [...empleadosPorDocumento.values()].find(
      ({ _id }) => String(_id) === String(empleadoAsignado)
    );
    return empleado && empleadosRetirados.has(empleado.documento);
  }).length;

  return {
    archivo: path.basename(ruta),
    modo: reemplazar ? 'reemplazo' : 'actualización',
    empleadosActivo,
    empleadosExtra,
    empleadosTotal: empleadosArray.length,
    empleadosRetirados: empleadosRetirados.size,
    lineasExcel: filasLineas.length,
    lineasGerencia: gerencia.size,
    lineasCancelar: cancelables.size,
    lineasTotal: lineasArray.length,
    lineasActivas: estadosLinea.ACTIVA,
    lineasDisponibles: estadosLinea.DISPONIBLE,
    lineasPorCancelar: estadosLinea.POR_CANCELAR,
    lineasCanceladas: estadosLinea.CANCELADA,
    alertasRetiradosConLinea,
    historial: movimientos.length,
    advertenciasTotal: advertencias.length,
    advertencias: advertencias.slice(0, 50),
    lineasSinAsignar: lineasArray.filter(({ empleadoAsignado }) => !empleadoAsignado).length,
    movilesImportados: lineasPorMovil.size
  };
}
