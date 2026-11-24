import LineaCorporativa from '../models/LineaCorporativa.js';
import HistorialMovimiento from '../models/HistorialMovimiento.js';
import {
  asignarLinea,
  liberarLinea,
  marcarParaCancelar
} from '../services/lineas.js';
import { getResumen, listarLineas } from '../services/consultas.js';
import AppError from '../utils/AppError.js';
import { success } from '../utils/response.js';

const CAMPOS_EMPLEADO = 'documento tipoDocumento nombresApellidos canal puntoVenta ciudad cargo estadoLaboral fechaRetiro';

export async function resumen(req, res) {
  success(res, await getResumen(req.query));
}

export async function listar(req, res) {
  const resultado = await listarLineas(req.query);
  success(res, resultado.data, 200, {
    total: resultado.total,
    page: resultado.page,
    limit: resultado.limit,
    totalPages: resultado.totalPages
  });
}

export async function obtener(req, res) {
  const linea = await LineaCorporativa.findById(req.params.id)
    .populate('empleadoAsignado', CAMPOS_EMPLEADO)
    .lean();
  if (!linea) throw new AppError('Línea no encontrada', 404);
  success(res, linea);
}

export async function crear(req, res) {
  if (req.body.estadoLinea === 'ACTIVA') {
    throw new AppError('Use el endpoint de asignación para activar una línea', 409);
  }

  const linea = await LineaCorporativa.create({
    movil: req.body.movil,
    operador: req.body.operador,
    canalAsignado: req.body.canalAsignado,
    estadoLinea: req.body.estadoLinea || 'DISPONIBLE',
    custCode: req.body.custCode,
    ciclo: req.body.ciclo,
    comentario: req.body.comentario,
    empleadoAsignado: null
  });

  success(res, linea, 201);
}

export async function actualizar(req, res) {
  const linea = await LineaCorporativa.findById(req.params.id);
  if (!linea) throw new AppError('Línea no encontrada', 404);

  for (const campo of ['movil', 'operador', 'canalAsignado', 'custCode', 'ciclo', 'comentario']) {
    if (req.body[campo] !== undefined) linea[campo] = req.body[campo];
  }

  await linea.save();
  await linea.populate('empleadoAsignado', CAMPOS_EMPLEADO);
  success(res, linea);
}

export async function eliminar(req, res) {
  const linea = await LineaCorporativa.findById(req.params.id);
  if (!linea) throw new AppError('Línea no encontrada', 404);
  if (linea.empleadoAsignado) {
    throw new AppError('No se puede eliminar una línea con empleado asignado', 409);
  }
  await Promise.all([
    linea.deleteOne(),
    HistorialMovimiento.deleteMany({ linea: linea._id })
  ]);
  success(res, { mensaje: 'Línea eliminada correctamente' });
}

export async function asignar(req, res) {
  const resultado = await asignarLinea(
    req.params.id,
    req.body.empleadoId,
    req.body.observacion
  );
  success(res, resultado, 201);
}

export async function liberar(req, res) {
  const resultado = await liberarLinea(req.params.id, req.body.observacion);
  success(res, resultado);
}

export async function marcarCancelar(req, res) {
  const resultado = await marcarParaCancelar(req.params.id, req.body.observacion);
  success(res, resultado);
}

export async function historial(req, res) {
  const linea = await LineaCorporativa.findById(req.params.id)
    .select('_id movil operador canalAsignado estadoLinea')
    .lean();
  if (!linea) throw new AppError('Línea no encontrada', 404);

  const movimientos = await HistorialMovimiento.find({ linea: linea._id })
    .populate('empleadoAnterior', CAMPOS_EMPLEADO)
    .populate('empleadoNuevo', CAMPOS_EMPLEADO)
    .sort({ fechaMovimiento: -1 })
    .lean();

  success(res, { linea, movimientos });
}
