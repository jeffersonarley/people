export const success = (res, data, statusCode = 200, meta = undefined) => {
  const body = { success: true, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
};
