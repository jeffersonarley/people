import { Router } from 'express';
import { body, query } from 'express-validator';
import { CANALES, ESTADOS_EMPLEADO, TIPOS_DOCUMENTO } from '../utils/enums.js';
import { handleValidation } from '../middleware/handleValidation.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/empleadosController.js';

const router = Router();

const enumerado = (campo, valores, opcional = true) =>
  body(campo).optional(opcional).isIn(valores).withMessage(`${campo} no válido`);

router.get('/empleados', [
  query('estadoLaboral').optional().isIn(ESTADOS_EMPLEADO).withMessage('Estado laboral no válido'),
  query('canal').optional().isIn(CANALES).withMessage('Canal no válido'),
  query('q').optional().trim().isLength({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 5000 }).toInt()
], handleValidation, listar);

router.get('/empleados/:id', validateObjectId(), obtener);
router.post('/empleados', [
  body('documento').trim().isLength({ min: 5, max: 30 }).withMessage('Documento inválido'),
  enumerado('tipoDocumento', TIPOS_DOCUMENTO),
  body('nombresApellidos').trim().isLength({ min: 2, max: 150 }).withMessage('Nombres y apellidos inválidos'),
  enumerado('canal', CANALES, false),
  body('puntoVenta').optional().trim().isLength({ max: 120 }),
  body('ciudad').optional().trim().isLength({ max: 80 }),
  body('cargo').optional().trim().isLength({ max: 120 }),
  enumerado('estadoLaboral', ESTADOS_EMPLEADO),
  body('fechaIngreso').optional({ nullable: true }).isISO8601().withMessage('Fecha de ingreso inválida'),
  body('fechaRetiro').optional({ nullable: true }).isISO8601().withMessage('Fecha de retiro inválida')
], handleValidation, crear);
router.put('/empleados/:id', validateObjectId(), [
  body('documento').optional().trim().isLength({ min: 5, max: 30 }),
  enumerado('tipoDocumento', TIPOS_DOCUMENTO),
  body('nombresApellidos').optional().trim().isLength({ min: 2, max: 150 }),
  enumerado('canal', CANALES),
  body('puntoVenta').optional().trim().isLength({ max: 120 }),
  body('ciudad').optional().trim().isLength({ max: 80 }),
  body('cargo').optional().trim().isLength({ max: 120 }),
  enumerado('estadoLaboral', ESTADOS_EMPLEADO),
  body('fechaIngreso').optional({ nullable: true }).isISO8601(),
  body('fechaRetiro').optional({ nullable: true }).isISO8601()
], handleValidation, actualizar);
router.delete('/empleados/:id', validateObjectId(), eliminar);

export default router;
