const express = require('express');
const Product = require('../models/Product');
const { buildProductQueryFromJson } = require('../services/queryService');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, price, stock } = req.body;
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ error: 'name and numeric price required' });
  }

  const doc = await Product.create({
    name,
    price,
    stock: typeof stock === 'number' ? stock : 0,
    createdBy: req.user._id
  });

  return res.status(201).json(doc);
});

router.get('/', async (_req, res) => {
  const docs = await Product.find().sort({ createdAt: -1 }).limit(50);
  return res.json(docs);
});

router.post('/search', async (req, res) => {
  // REQUEST JSON -> QUERY OBJECT TRACE POINT.
  const query = buildProductQueryFromJson(req.body.filter);
  const docs = await Product.find(query).limit(50);
  return res.json({ query, docs });
});

router.patch('/:id', async (req, res) => {
  const doc = await Product.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });

  // OWNERSHIP CHECK: only creator or admin can edit.
  const owner = doc.createdBy.toString() === req.user._id.toString();
  if (!owner && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'not your product' });
  }

  ['name', 'price', 'stock'].forEach((k) => {
    if (k in req.body) doc[k] = req.body[k];
  });

  await doc.save();
  return res.json(doc);
});

router.delete('/:id', async (req, res) => {
  const doc = await Product.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });

  const owner = doc.createdBy.toString() === req.user._id.toString();
  if (!owner && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'not your product' });
  }

  await doc.deleteOne();
  return res.json({ message: 'deleted' });
});

module.exports = router;
