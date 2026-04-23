const User = require('../models/User');
const env = require('../config/env');
const { parseToken } = require('../utils/auth');

async function requireAuth(req, res, next) {
  // TRUST BOUNDARY: cookie/token -> authenticated user object.
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'auth required' });

  try {
    const claims = parseToken(token);
    const user = await User.findById(claims.sub);
    if (!user) return res.status(401).json({ error: 'invalid user' });

    req.user = user;

    // TRAINING HOOK (UNSAFE): optional impersonation via user-controlled header.
    if (env.toggles.allowDevImpersonation && req.headers['x-dev-user']) {
      const maybe = await User.findOne({ email: String(req.headers['x-dev-user']) });
      if (maybe) req.user = maybe;
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function requireAdmin(req, res, next) {
  // AUTHZ CHECK: role-based guard for admin routes.
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'admin only' });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
