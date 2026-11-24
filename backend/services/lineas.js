import LineaCorporativa from '../models/LineaCorporativa.js';
import HistorialMovimiento from '../models/HistorialMovimiento.js';
import Empleado from '../models/Empleado.js';
import AppError from '../utils/AppError.js';

const CAMPOS_EMPLEADO = 'documento tipoDocumento nombresApellidos canal cargo estadoLaboral';

async function poblarLinea(linea) {
  await linea.populate('empleadoAsignado', CAMPOS_EMPLEADO);
  return linea;
}

export async function asignarLinea(lineaId, empleadoId, observacion = '') {
  const [linea, empleado] = await Promise.all([
    LineaCorporativa.findById(lineaId),
    Empleado.findById(empleadoId)
  ]);

  if (!linea) throw new AppError('Línea no encontrada', 404);
  if (!empleado) throw new AppError('Empleado no encontrado', 404);
  if (empleado.estadoLaboral !== 'ACTIVO') {
    throw new AppError('Solo se pueden asignar líneas a empleados con estado ACTIVO', 409);
  }
  if (linea.estadoLinea === 'POR_CANCELAR') {
    throw new AppError('La línea está marcada para cancelación', 409);
  }
  if (linea.estadoLinea === 'CANCELADA') {
    throw new AppError('La línea está cancelada y no puede asignarse', 409);
  }

  const empleadoAnterior = linea.empleadoAsignado;
  if (empleadoAnterior && String(empleadoAnterior) === String(empleado._id)) {
    throw new AppError('La línea ya está asignada a este empleado', 409);
  }

  linea.empleadoAsignado = empleado._id;
  linea.estadoLinea = 'ACTIVA';
  linea.canalAsignado = empleado.canal;
  await linea.save();

  const movimiento = await HistorialMovimiento.create({
    linea: linea._id,
    empleadoAnterior: empleadoAnterior || null,
    empleadoNuevo: empleado._id,
    tipoMovimiento: empleadoAnterior ? 'REASIGNACION' : 'ASIGNACION',
    observacion,
    fechaMovimiento: new Date()
  });

  await poblarLinea(linea);
  await movimiento.populate([
    { path: 'empleadoAnterior', select: CAMPOS_EMPLEADO },
    { path: 'empleadoNuevo', select: CAMPOS_EMPLEADO }
  ]);

  return { linea, movimiento };
}

export async function liberarLinea(lineaId, observacion = '') {
  const linea = await LineaCorporativa.findById(lineaId);
  if (!linea) throw new AppError('Línea no encontrada', 404);
  if (!linea.empleadoAsignado) throw new AppError('La línea no tiene un empleado asignado', 409);
  if (linea.estadoLinea === 'CANCELADA') throw new AppError('La línea está cancelada', 409);

  const empleadoAnterior = linea.empleadoAsignado;
  linea.empleadoAsignado = null;
  linea.estadoLinea = 'DISPONIBLE';
  await linea.save();

  const movimiento = await HistorialMovimiento.create({
    linea: linea._id,
    empleadoAnterior,
    empleadoNuevo: null,
    tipoMovimiento: 'DEVOLUCION',
    observacion,
    fechaMovimiento: new Date()
  });

  await movimiento.populate('empleadoAnterior', CAMPOS_EMPLEADO);
  return { linea, movimiento };
}

export async function marcarParaCancelar(lineaId, observacion = '') {
  const linea = await LineaCorporativa.findById(lineaId);
  if (!linea) throw new AppError('Línea no encontrada', 404);
  if (linea.estadoLinea === 'CANCELADA') throw new AppError('La línea ya está cancelada', 409);
  if (linea.estadoLinea === 'POR_CANCELAR') {
    throw new AppError('La línea ya está marcada para cancelación', 409);
  }

  const empleadoActual = linea.empleadoAsignado;
  linea.estadoLinea = 'POR_CANCELAR';
  await linea.save();

  const movimiento = await HistorialMovimiento.create({
    linea: linea._id,
    empleadoAnterior: empleadoActual || null,
    empleadoNuevo: empleadoActual || null,
    tipoMovimiento: 'MARCADA_CANCELAR',
    observacion,
    fechaMovimiento: new Date()
  });

  await poblarLinea(linea);
  return { linea, movimiento };
}
