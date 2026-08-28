const asyncHandler = require("../../utils/asyncHandler");
const env = require("../../config/env");
const service = require("./auth.service");

const REFRESH_COOKIE = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/api/auth",
};

const register = asyncHandler(async (req, res) => {
  const user = await service.register(req.body);
  res.status(201).json({ success: true, data: user });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await service.login(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.json({ success: true, data: { user, accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const oldToken = req.cookies?.[REFRESH_COOKIE];
  const { user, accessToken, refreshToken } = await service.refresh(oldToken);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.json({ success: true, data: { user, accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  await service.logout(token);
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  res.json({ success: true, data: { message: "Logged out" } });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { register, login, refresh, logout, me };
