import LineaCorporativa from '../models/LineaCorporativa.js';
import Empleado from '../models/Empleado.js';
import { CANALES } from '../utils/enums.js';

const CAMPOS_EMPLEADO = 'documento tipoDocumento nombresApellidos canal puntoVenta ciudad cargo estadoLaboral fechaRetiro';

function escaparRegex(valor) {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filtroCanal(canal) {
  return canal ? { canalAsignado: canal } : {};
}

export async function getResumen({ canal } = {}) {
  const filtro = filtroCanal(canal);
  const [total, activas, asignadas, disponibles, porCancelar, canceladas, lineasConEmpleado, lineasPorCancelar] =
    await Promise.all([
      LineaCorporativa.countDocuments(filtro),
      LineaCorporativa.countDocuments({ ...filtro, estadoLinea: 'ACTIVA' }),
      LineaCorporativa.countDocuments({ ...filtro, empleadoAsignado: { $ne: null } }),
      LineaCorporativa.countDocuments({ ...filtro, estadoLinea: 'DISPONIBLE' }),
      LineaCorporativa.countDocuments({ ...filtro, estadoLinea: 'POR_CANCELAR' }),
      LineaCorporativa.countDocuments({ ...filtro, estadoLinea: 'CANCELADA' }),
      LineaCorporativa.find({ ...filtro, empleadoAsignado: { $ne: null } })
        .populate('empleadoAsignado', CAMPOS_EMPLEADO)
        .lean(),
      LineaCorporativa.find({ ...filtro, estadoLinea: 'POR_CANCELAR' })
        .populate('empleadoAsignado', CAMPOS_EMPLEADO)
        .sort({ updatedAt: -1 })
        .lean()
    ]);

  const lineasRetirados = lineasConEmpleado.filter(
    ({ empleadoAsignado }) => empleadoAsignado?.estadoLaboral === 'RETIRADO'
  );

  const alertas = [
    ...lineasRetirados.map((linea) => ({
      tipo: 'RETIRADO_CON_LINEA',
      mensaje: `Línea ${linea.movil} asignada a ${linea.empleadoAsignado.nombresApellidos}, empleado RETIRADO`,
      detalle: `${linea.operador} · ${linea.canalAsignado} · ${linea.empleadoAsignado.documento}`,
      canal: linea.canalAsignado,
      fecha: linea.empleadoAsignado.fechaRetiro || linea.updatedAt,
      estado: 'CRITICA',
      lineaId: linea._id,
      movil: linea.movil
    })),
    ...lineasPorCancelar.map((linea) => ({
      tipo: 'POR_CANCELAR',
      mensaje: `Línea ${linea.movil} pendiente por cancelar`,
      detalle: linea.comentario || `${linea.operador} · ${linea.canalAsignado}`,
      canal: linea.canalAsignado,
      fecha: linea.updatedAt,
      estado: 'PENDIENTE',
      lineaId: linea._id,
      movil: linea.movil
    }))
  ];

  return {
    canal: canal || null,
    total,
    activas,
    asignadas,
    disponibles,
    porCancelar,
    canceladas,
    alertaCritica: {
      cantidad: lineasRetirados.length,
      lineas: lineasRetirados
    },
    lineasPorCancelar,
    alertas,
    canales: CANALES
  };
}

export async function listarLineas(filtros = {}) {
  const { canal, operador, estadoLinea, q, page = 1, limit = 100 } = filtros;
  const consulta = {};

  if (canal) consulta.canalAsignado = canal;
  if (operador) consulta.operador = operador;
  if (estadoLinea) consulta.estadoLinea = estadoLinea;

  if (q) {
    const termino = escaparRegex(q.trim());
    const empleados = await Empleado.find({
      $or: [
        { documento: { $regex: termino, $options: 'i' } },
        { nombresApellidos: { $regex: termino, $options: 'i' } }
      ]
    })
      .select('_id')
      .lean();

    consulta.$or = [
      { movil: { $regex: termino, $options: 'i' } },
      { custCode: { $regex: termino, $options: 'i' } },
      { empleadoAsignado: { $in: empleados.map(({ _id }) => _id) } }
    ];
  }

  const pagina = Math.max(Number(page) || 1, 1);
  const limite = Math.min(Math.max(Number(limit) || 100, 1), 5000);
  const skip = (pagina - 1) * limite;

  const [data, total] = await Promise.all([
    LineaCorporativa.find(consulta)
      .populate('empleadoAsignado', CAMPOS_EMPLEADO)
      .sort({ canalAsignado: 1, movil: 1 })
      .skip(skip)
      .limit(limite)
      .lean(),
    LineaCorporativa.countDocuments(consulta)
  ]);

  return {
    data,
    total,
    page: pagina,
    limit: limite,
    totalPages: Math.ceil(total / limite)
  };
}
