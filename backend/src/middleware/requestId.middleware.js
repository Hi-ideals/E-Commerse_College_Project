const crypto = require("crypto");

/**
 * Attaches a short request id to req/res for log correlation, and echoes
 * it back as X-Request-Id so a client (or this same API's error logs)
 * can tie a support report to one specific request.
 */
function requestId(req, res, next) {
  const id = req.headers["x-request-id"] || crypto.randomBytes(8).toString("hex");
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}

module.exports = requestId;
