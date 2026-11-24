import mongoose from 'mongoose';
import { CANALES, ESTADOS_EMPLEADO, TIPOS_DOCUMENTO } from '../utils/enums.js';

const empleadoSchema = new mongoose.Schema(
  {
    documento: {
      type: String,
      required: [true, 'El documento es obligatorio'],
      unique: true,
      trim: true,
      index: true
    },
    tipoDocumento: {
      type: String,
      enum: { values: TIPOS_DOCUMENTO, message: 'Tipo de documento no válido' },
      default: 'CC'
    },
    nombresApellidos: {
      type: String,
      required: [true, 'Los nombres y apellidos son obligatorios'],
      trim: true,
      maxlength: 150,
      index: true
    },
    canal: {
      type: String,
      required: [true, 'El canal es obligatorio'],
      enum: { values: CANALES, message: 'Canal no válido' },
      trim: true,
      index: true
    },
    puntoVenta: {
      type: String,
      trim: true,
      maxlength: 120
    },
    ciudad: {
      type: String,
      trim: true,
      maxlength: 80
    },
    cargo: {
      type: String,
      trim: true,
      maxlength: 120
    },
    estadoLaboral: {
      type: String,
      enum: { values: ESTADOS_EMPLEADO, message: 'Estado laboral no válido' },
      default: 'ACTIVO',
      index: true
    },
    fechaIngreso: {
      type: Date,
      default: null
    },
    fechaRetiro: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

empleadoSchema.index({ canal: 1, estadoLaboral: 1 });

export default mongoose.model('Empleado', empleadoSchema);
