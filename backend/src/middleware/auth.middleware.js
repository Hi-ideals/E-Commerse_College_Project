const { verifyAccessToken } = require("../utils/jwt");
const ApiError = require("../utils/apiError");

/**
 * Verifies the Bearer access token and attaches { id, role } to req.user.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(ApiError.unauthorized("Missing or malformed Authorization header"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    next(ApiError.unauthorized("Invalid or expired access token"));
  }
}

/**
 * Optional auth: attaches req.user if a valid token is present, but never
 * blocks the request (used for routes that behave differently when logged in).
 */
function authenticateOptional(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme === "Bearer" && token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role, email: payload.email };
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }
  next();
}

module.exports = { authenticate, authenticateOptional };
