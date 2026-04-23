const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signAuthToken } = require('../utils/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  // ENTRY POINT: user-controlled registration body.
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'email, password, displayName required' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'email already used' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, displayName, role: 'user' });
  return res.json({ id: user._id, email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await bcrypt.compare(password || '', user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const token = signAuthToken(user);
  // SESSION FLOW: JWT stored in auth cookie.
  res.cookie('auth_token', token, { httpOnly: true, sameSite: 'lax' });

  return res.json({ message: 'logged in', role: user.role });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token');
  return res.json({ message: 'logged out' });
});

module.exports = router;
