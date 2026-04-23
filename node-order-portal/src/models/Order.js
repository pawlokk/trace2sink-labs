const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
    status: { type: String, enum: ['new', 'approved', 'shipped'], default: 'new' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
