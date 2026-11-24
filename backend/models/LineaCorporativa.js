import mongoose from 'mongoose';
import { CANALES, ESTADOS_LINEA, OPERADORES } from '../utils/enums.js';

const lineaSchema = new mongoose.Schema(
  {
    movil: {
      type: String,
      required: [true, 'El móvil es obligatorio'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'El móvil debe tener exactamente 10 dígitos'],
      index: true
    },
    operador: {
      type: String,
      required: [true, 'El operador es obligatorio'],
      enum: { values: OPERADORES, message: 'Operador no válido' },
      index: true
    },
    estadoLinea: {
      type: String,
      enum: { values: ESTADOS_LINEA, message: 'Estado de línea no válido' },
      default: 'DISPONIBLE',
      index: true
    },
    canalAsignado: {
      type: String,
      required: [true, 'El canal es obligatorio'],
      enum: { values: CANALES, message: 'Canal no válido' },
      trim: true,
      index: true
    },
    empleadoAsignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      default: null,
      index: true
    },
    custCode: {
      type: String,
      trim: true,
      maxlength: 60
    },
    ciclo: {
      type: String,
      trim: true,
      maxlength: 60
    },
    comentario: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

lineaSchema.index({ canalAsignado: 1, operador: 1, estadoLinea: 1 });

export default mongoose.model('LineaCorporativa', lineaSchema);
