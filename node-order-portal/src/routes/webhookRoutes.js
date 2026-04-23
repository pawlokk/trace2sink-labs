const express = require('express');
const ImportLog = require('../models/ImportLog');
const { buildImportPreview } = require('../services/importService');

const router = express.Router();

router.post('/inventory-sync', async (req, res) => {
  // WEBHOOK/IMPORT ENDPOINT: no auth by design for training.
  // TRUST BOUNDARY: external JSON payload enters DB storage flow.
  const payload = req.body;

  const previewText = buildImportPreview(payload);
  const log = await ImportLog.create({
    source: payload.source || 'inventory-sync',
    payload,
    previewText,
    receivedBy: req.ip
  });

  return res.json({ ok: true, id: log._id, previewText });
});

module.exports = router;
