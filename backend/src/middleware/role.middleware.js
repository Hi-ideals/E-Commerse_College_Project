const ApiError = require("../utils/apiError");

/**
 * Restricts a route to one or more roles. Must run after `authenticate`.
 * Usage: router.post('/', authenticate, requireRole('admin'), handler)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires role: ${allowedRoles.join(" or ")}`));
    }
    next();
  };
}

module.exports = { requireRole };
