import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let details = err.details;

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Identificador inválido';
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Los datos enviados no son válidos';
    details = Object.values(err.errors).map(({ path, message: validationMessage }) => ({ campo: path, mensaje: validationMessage }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    message = `Ya existe un registro con el mismo ${campo}`;
  }

  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {})
    }
  });
}
