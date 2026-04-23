const express = require('express');
const env = require('../config/env');

const router = express.Router();

router.get('/me', async (req, res) => {
  return res.json({
    id: req.user._id,
    email: req.user.email,
    displayName: req.user.displayName,
    role: req.user.role,
    profile: req.user.profile
  });
});

router.patch('/me', async (req, res) => {
  // ENTRY POINT: profile update body.
  const allowed = ['displayName', 'profile'];
  const patch = {};

  if (env.toggles.allowProfileHiddenFields) {
    // TRAINING HOOK (UNSAFE): mass assignment-like update on user object.
    Object.assign(req.user, req.body);
  } else {
    for (const key of allowed) {
      if (key in req.body) patch[key] = req.body[key];
    }
    Object.assign(req.user, patch);
  }

  // HIDDEN FIELD NOTE: role/passwordHash are sensitive and should not be user-settable.
  await req.user.save();

  return res.json({
    message: 'profile updated',
    user: {
      email: req.user.email,
      displayName: req.user.displayName,
      role: req.user.role,
      profile: req.user.profile
    }
  });
});

module.exports = router;
