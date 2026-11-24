import Empleado from '../models/Empleado.js';
import LineaCorporativa from '../models/LineaCorporativa.js';
import AppError from '../utils/AppError.js';
import { success } from '../utils/response.js';

const CAMPOS_LINEA = 'movil operador estadoLinea canalAsignado custCode ciclo';

function escaparRegex(valor) {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function lineasPorEmpleado(empleados) {
  const ids = empleados.map(({ _id }) => _id);
  if (!ids.length) return new Map();

  const lineas = await LineaCorporativa.find({ empleadoAsignado: { $in: ids } })
    .select(`${CAMPOS_LINEA} empleadoAsignado`)
    .sort({ movil: 1 })
    .lean();

  return lineas.reduce((mapa, linea) => {
    const key = String(linea.empleadoAsignado);
    if (!mapa.has(key)) mapa.set(key, []);
    mapa.get(key).push(linea);
    return mapa;
  }, new Map());
}

function adjuntarLineas(empleado, mapa) {
  const lineas = mapa.get(String(empleado._id)) || [];
  return { ...empleado, lineas, lineaActual: lineas[0] || null };
}

export async function listar(req, res) {
  const { estadoLaboral, canal, q, page = 1, limit = 100 } = req.query;
  const filtro = {};

  if (estadoLaboral) filtro.estadoLaboral = estadoLaboral;
  if (canal) filtro.canal = canal;

  if (q) {
    const termino = escaparRegex(q.trim());
    filtro.$or = [
      { documento: { $regex: termino, $options: 'i' } },
      { nombresApellidos: { $regex: termino, $options: 'i' } },
      { cargo: { $regex: termino, $options: 'i' } }
    ];
  }

  const pagina = Math.max(Number(page) || 1, 1);
  const limite = Math.min(Math.max(Number(limit) || 100, 1), 5000);
  const skip = (pagina - 1) * limite;

  const [empleados, total] = await Promise.all([
    Empleado.find(filtro)
      .sort({ nombresApellidos: 1 })
      .skip(skip)
      .limit(limite)
      .lean(),
    Empleado.countDocuments(filtro)
  ]);

  const mapaLineas = await lineasPorEmpleado(empleados);
  const data = empleados.map((empleado) => adjuntarLineas(empleado, mapaLineas));

  success(res, data, 200, {
    total,
    page: pagina,
    limit: limite,
    totalPages: Math.ceil(total / limite)
  });
}

export async function obtener(req, res) {
  const empleado = await Empleado.findById(req.params.id).lean();
  if (!empleado) throw new AppError('Empleado no encontrado', 404);

  const mapaLineas = await lineasPorEmpleado([empleado]);
  success(res, adjuntarLineas(empleado, mapaLineas));
}

export async function crear(req, res) {
  const empleado = await Empleado.create(req.body);
  success(res, empleado, 201);
}

export async function actualizar(req, res) {
  const empleado = await Empleado.findById(req.params.id);
  if (!empleado) throw new AppError('Empleado no encontrado', 404);

  for (const campo of [
    'documento',
    'tipoDocumento',
    'nombresApellidos',
    'canal',
    'puntoVenta',
    'ciudad',
    'cargo',
    'estadoLaboral',
    'fechaIngreso',
    'fechaRetiro'
  ]) {
    if (req.body[campo] !== undefined) empleado[campo] = req.body[campo];
  }

  if (req.body.estadoLaboral === 'RETIRADO' && !empleado.fechaRetiro) {
    empleado.fechaRetiro = new Date();
  }
  if (req.body.estadoLaboral === 'ACTIVO') {
    empleado.fechaRetiro = null;
  }

  await empleado.save();

  const mapaLineas = await lineasPorEmpleado([empleado]);
  const payload = adjuntarLineas(empleado.toObject(), mapaLineas);

  if (empleado.estadoLaboral === 'RETIRADO' && payload.lineas.length) {
    payload.advertencia = {
      mensaje: 'El empleado quedó RETIRADO y aún tiene líneas corporativas asignadas.',
      lineas: payload.lineas
    };
  }

  success(res, payload);
}

export async function eliminar(req, res) {
  const empleado = await Empleado.findById(req.params.id);
  if (!empleado) throw new AppError('Empleado no encontrado', 404);

  const linea = await LineaCorporativa.findOne({ empleadoAsignado: empleado._id });
  if (linea) {
    throw new AppError('No se puede eliminar un empleado con líneas asignadas', 409);
  }

  await empleado.deleteOne();
  success(res, { mensaje: 'Empleado eliminado correctamente' });
}
