import { Router } from 'express';
import { body, query } from 'express-validator';
import { CANALES, ESTADOS_LINEA, OPERADORES } from '../utils/enums.js';
import { handleValidation } from '../middleware/handleValidation.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  resumen,
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  asignar,
  liberar,
  marcarCancelar,
  historial
} from '../controllers/lineasController.js';

const router = Router();

const enumerado = (campo, valores, opcional = true) =>
  body(campo).optional(opcional).isIn(valores).withMessage(`${campo} no válido`);

router.get('/dashboard/resumen', [
  query('canal').optional().isIn(CANALES).withMessage('Canal no válido')
], handleValidation, resumen);

router.get('/lineas', [
  query('canal').optional().isIn(CANALES).withMessage('Canal no válido'),
  query('operador').optional().isIn(OPERADORES).withMessage('Operador no válido'),
  query('estadoLinea').optional().isIn(ESTADOS_LINEA).withMessage('Estado de línea no válido'),
  query('q').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Búsqueda inválida'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 5000 }).toInt()
], handleValidation, listar);

router.get('/lineas/:id/historial', validateObjectId(), historial);
router.post('/lineas/:id/asignar', validateObjectId(), [
  body('empleadoId').isMongoId().withMessage('empleadoId inválido'),
  body('observacion').optional().trim().isLength({ max: 500 })
], handleValidation, asignar);
router.post('/lineas/:id/liberar', validateObjectId(), [
  body('observacion').optional().trim().isLength({ max: 500 })
], handleValidation, liberar);
router.post('/lineas/:id/marcar-cancelar', validateObjectId(), [
  body('observacion').optional().trim().isLength({ max: 500 })
], handleValidation, marcarCancelar);

router.get('/lineas/:id', validateObjectId(), obtener);
router.post('/lineas', [
  body('movil').matches(/^\d{10}$/).withMessage('El móvil debe tener exactamente 10 dígitos'),
  enumerado('operador', OPERADORES, false),
  enumerado('canalAsignado', CANALES, false),
  enumerado('estadoLinea', ESTADOS_LINEA),
  body('custCode').optional().trim().isLength({ max: 60 }),
  body('ciclo').optional().trim().isLength({ max: 60 }),
  body('comentario').optional().trim().isLength({ max: 500 })
], handleValidation, crear);
router.put('/lineas/:id', validateObjectId(), [
  body('movil').optional().matches(/^\d{10}$/).withMessage('El móvil debe tener exactamente 10 dígitos'),
  enumerado('operador', OPERADORES),
  enumerado('canalAsignado', CANALES),
  body('custCode').optional().trim().isLength({ max: 60 }),
  body('ciclo').optional().trim().isLength({ max: 60 }),
  body('comentario').optional().trim().isLength({ max: 500 })
], handleValidation, actualizar);
router.delete('/lineas/:id', validateObjectId(), eliminar);

export default router;
