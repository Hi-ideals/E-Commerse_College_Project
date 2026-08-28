/**
 * Wraps an async Express route/middleware handler so any rejected promise
 * is forwarded to next(err) instead of crashing the process.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
