const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const { connectDb } = require('./config/db');
const { requireAuth, requireAdmin } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const apiRoutes = require('./routes/apiRoutes');

async function start() {
  await connectDb();

  const app = express();

  // MIDDLEWARE CHAIN TRACE START
  app.use(morgan('dev'));
  app.use(express.json({ limit: '200kb' })); // JSON body parser trust boundary
  app.use(cookieParser()); // cookie -> auth token flow

  app.get('/health', (_req, res) => {
    res.json({ ok: true, app: 'node-order-portal' });
  });

  app.use('/auth', authRoutes);
  app.use('/webhooks', webhookRoutes);
  app.use('/api', apiRoutes);

  // AUTHENTICATED AREA
  app.use('/profile', requireAuth, profileRoutes);
  app.use('/products', requireAuth, productRoutes);
  app.use('/orders', requireAuth, orderRoutes);

  // ADMIN AREA (auth + role middleware chain)
  app.use('/admin', requireAuth, requireAdmin, adminRoutes);

  app.use((err, _req, res, _next) => {
    console.error('[error]', err);
    res.status(500).json({ error: 'server error' });
  });

  app.listen(env.port, () => {
    console.log(`[app] listening on ${env.port}`);
    console.log(`[debug] node inspector expected on ${env.debugPort} when started with npm run debug`);
  });
}

start().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
