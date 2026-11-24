import mongoose from 'mongoose';

export function isValidObjectId(value) {
  return mongoose.isValidObjectId(value) && String(new mongoose.Types.ObjectId(value)) === String(value);
}
