import { isValidObjectId } from '../utils/objectId.js';
import AppError from '../utils/AppError.js';

export function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    if (!isValidObjectId(req.params[paramName])) {
      return next(new AppError(`Identificador inválido: ${paramName}`, 400));
    }
    next();
  };
}
