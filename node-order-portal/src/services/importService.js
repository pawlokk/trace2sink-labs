const env = require('../config/env');

function buildImportPreview(payload) {
  // STORED-DATA PATH: payload is persisted and later re-used in admin review.
  if (env.toggles.unsafeRenderHelper) {
    // TRAINING HOOK (UNSAFE): dynamic expression evaluation.
    const expr = String(payload.previewExpr || 'JSON.stringify(payload)');
    return Function('payload', `return ${expr}`)(payload);
  }

  // SAFE BRANCH: string formatting only.
  return `source=${payload.source || 'unknown'} items=${Array.isArray(payload.items) ? payload.items.length : 0}`;
}

module.exports = { buildImportPreview };
