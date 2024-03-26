/* eslint-disable */
class AppError extends Error {
  // inherit from class error

  constructor(message, statusCode) {
    super(message); // super calls the parent constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // apply on operational errors / expected errors
    Error.captureStackTrace(this, this.constructor); // error stack shows where the error is
  }
}
module.exports = AppError;
