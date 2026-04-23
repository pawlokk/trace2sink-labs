const env = require('../config/env');

function safeAssign(target, patch) {
  return Object.assign(target, patch);
}

function unsafeDeepMerge(target, source) {
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      unsafeDeepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function applyMerge(target, patch) {
  // TRAINING HOOK: toggle between safe shallow assignment and unsafe recursive merge.
  if (env.toggles.unsafeMerge) {
    return unsafeDeepMerge(target, patch);
  }
  return safeAssign(target, patch);
}

module.exports = { applyMerge };
