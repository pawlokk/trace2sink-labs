const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.get('/summary', async (_req, res) => {
  // LIGHTWEIGHT INTERNAL API endpoint.
  const products = await Product.countDocuments();
  return res.json({ products, serverTs: new Date().toISOString() });
});

module.exports = router;
