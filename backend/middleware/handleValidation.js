import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

export function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array().map(({ path, msg }) => ({ campo: path, mensaje: msg }));
    return next(new AppError('Los datos enviados no son válidos', 422, details));
  }
  next();
}
