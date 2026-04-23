const env = require('../config/env');

function buildProductQueryFromJson(raw) {
  // ENTRY POINT: req.body.filter arrives from JSON body parser.
  const filter = raw && typeof raw === 'object' ? raw : {};

  // TRAINING HOOK (UNSAFE): request JSON becomes DB query object directly.
  if (env.toggles.trustRawFilter) {
    return filter;
  }

  // SAFE BRANCH: allowlist fields and simple transformations.
  const query = {};
  if (typeof filter.name === 'string') {
    query.name = new RegExp(filter.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  if (typeof filter.minPrice === 'number' || typeof filter.maxPrice === 'number') {
    query.price = {};
    if (typeof filter.minPrice === 'number') query.price.$gte = filter.minPrice;
    if (typeof filter.maxPrice === 'number') query.price.$lte = filter.maxPrice;
  }
  return query;
}

module.exports = { buildProductQueryFromJson };
