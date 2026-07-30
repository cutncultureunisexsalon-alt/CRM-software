import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // #region debug-point E:backend-login-entry
  fetch('http://127.0.0.1:7777/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'login-failed',
      runId: 'pre-fix',
      hypothesisId: 'E',
      location: 'backend/src/controllers/authController.js:login',
      msg: '[DEBUG] Backend login endpoint hit',
      data: {
        email: email?.trim()?.toLowerCase(),
        hasPassword: Boolean(password),
        origin: req.headers.origin,
        host: req.headers.host,
      },
      ts: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const result = await AuthService.login(email, password);

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const admin = await AuthService.getProfile(req.admin.id);

  res.json({
    success: true,
    data: admin,
  });
});

export const verifyToken = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.admin,
  });
});
