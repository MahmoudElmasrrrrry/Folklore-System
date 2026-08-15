export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
  statusCode = 400;
  status = "fail";

  const errors = {};

  Object.keys(err.errors).forEach((field) => {
    errors[field] = err.errors[field].message;
  });

  return res.status(statusCode).json({
    status,
    message: "Validation failed",
    errors,
  });
}

  res.status(statusCode).json({
    status,
    message,
  });
};