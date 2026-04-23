const express = require('express');
const ImportLog = require('../models/ImportLog');
const { applyMerge } = require('../utils/merge');

const router = express.Router();

const runtimeSettings = {
  portalTitle: 'Internal Order Portal',
  webhookStrictMode: true,
  ui: { badge: 'LAB' }
};

router.get('/imports', async (_req, res) => {
  // ADMIN-ONLY ACTION: review stored webhook/import activity.
  const docs = await ImportLog.find().sort({ createdAt: -1 }).limit(50);
  return res.json({ settings: runtimeSettings, imports: docs });
});

router.patch('/settings', (req, res) => {
  // ENTRY POINT: privileged settings update from admin JSON.
  // TRAINING HOOK: unsafe recursive object merge may expose pollution-like behavior.
  applyMerge(runtimeSettings, req.body);
  return res.json({ message: 'settings updated', settings: runtimeSettings });
});

module.exports = router;
