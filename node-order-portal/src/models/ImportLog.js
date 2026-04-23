const mongoose = require('mongoose');

const ImportLogSchema = new mongoose.Schema(
  {
    source: { type: String, default: 'webhook' },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    previewText: { type: String, default: '' },
    receivedBy: { type: String, default: 'system' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImportLog', ImportLogSchema);
