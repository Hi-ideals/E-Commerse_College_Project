/**
 * Tiny duration parser for strings like "15m", "7d", "1h", "30s".
 * Returns milliseconds. Falls back to treating a bare number as ms.
 */
const UNITS = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

function parseDuration(input) {
  if (typeof input === "number") return input;
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(String(input).trim());
  if (!match) {
    const n = Number(input);
    if (!Number.isNaN(n)) return n;
    throw new Error(`Invalid duration string: ${input}`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNITS[unit];
}

module.exports = parseDuration;
