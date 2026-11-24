import mongoose from 'mongoose';
import { TIPOS_MOVIMIENTO } from '../utils/enums.js';

const historialSchema = new mongoose.Schema(
  {
    linea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LineaCorporativa',
      required: true,
      index: true
    },
    empleadoAnterior: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      default: null
    },
    empleadoNuevo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      default: null
    },
    tipoMovimiento: {
      type: String,
      required: true,
      enum: { values: TIPOS_MOVIMIENTO, message: 'Tipo de movimiento no válido' },
      index: true
    },
    observacion: {
      type: String,
      trim: true,
      maxlength: 500
    },
    fechaMovimiento: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

historialSchema.index({ linea: 1, fechaMovimiento: -1 });

export default mongoose.model('HistorialMovimiento', historialSchema);
