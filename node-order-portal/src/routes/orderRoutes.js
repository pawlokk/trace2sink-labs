const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

router.post('/', async (req, res) => {
  const { productId, quantity, note } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(400).json({ error: 'invalid product' });

  const order = await Order.create({
    ownerId: req.user._id,
    productId,
    quantity: Number(quantity || 1),
    note: String(note || '')
  });

  return res.status(201).json(order);
});

router.get('/', async (req, res) => {
  // OWNERSHIP FILTER: users see own orders, admin sees all.
  const filter = req.user.role === 'admin' ? {} : { ownerId: req.user._id };
  const docs = await Order.find(filter).populate('productId', 'name price').sort({ createdAt: -1 });
  return res.json(docs);
});

router.patch('/:id', async (req, res) => {
  const doc = await Order.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });

  const owner = doc.ownerId.toString() === req.user._id.toString();
  if (!owner && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'not your order' });
  }

  ['quantity', 'note', 'status'].forEach((k) => {
    if (k in req.body) doc[k] = req.body[k];
  });

  await doc.save();
  return res.json(doc);
});

router.delete('/:id', async (req, res) => {
  const doc = await Order.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });

  const owner = doc.ownerId.toString() === req.user._id.toString();
  if (!owner && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'not your order' });
  }

  await doc.deleteOne();
  return res.json({ message: 'deleted' });
});

module.exports = router;
