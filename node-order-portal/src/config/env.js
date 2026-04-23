const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

module.exports = {
  port: Number(process.env.PORT || 3002),
  debugPort: Number(process.env.DEBUG_PORT || 9229),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/order_portal',
  jwtSecret: process.env.JWT_SECRET || 'change-me-training-only',
  jwtExpires: process.env.JWT_EXPIRES || '4h',
  toggles: {
    trustRawFilter: process.env.TRUST_RAW_FILTER === 'true',
    allowProfileHiddenFields: process.env.ALLOW_PROFILE_HIDDEN_FIELDS === 'true',
    allowDevImpersonation: process.env.ALLOW_DEV_IMPERSONATION === 'true',
    unsafeMerge: process.env.UNSAFE_MERGE === 'true',
    unsafeRenderHelper: process.env.UNSAFE_RENDER_HELPER === 'true'
  }
};
