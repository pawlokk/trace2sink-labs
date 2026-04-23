const bcrypt = require('bcryptjs');
const { connectDb } = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const ImportLog = require('../src/models/ImportLog');

async function run() {
  await connectDb();

  const users = [
    {
      email: 'admin@lab.local',
      password: 'admin123!',
      displayName: 'Lab Admin',
      role: 'admin',
      profile: { bio: 'portal admin', team: 'ops', importTag: 'root-seed' }
    },
    {
      email: 'alice@lab.local',
      password: 'alice123!',
      displayName: 'Alice',
      role: 'user',
      profile: { bio: 'buyer', team: 'sales', importTag: 'A-1' }
    },
    {
      email: 'bob@lab.local',
      password: 'bob123!',
      displayName: 'Bob',
      role: 'user',
      profile: { bio: 'warehouse', team: 'ops', importTag: 'B-1' }
    }
  ];

  const existing = await User.countDocuments();
  if (existing > 0) {
    console.log('[seed] users already exist, skipping user seed');
  } else {
    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({
        email: u.email,
        passwordHash,
        displayName: u.displayName,
        role: u.role,
        profile: u.profile
      });
    }
    console.log('[seed] users seeded');
  }

  const admin = await User.findOne({ email: 'admin@lab.local' });
  const alice = await User.findOne({ email: 'alice@lab.local' });

  if ((await Product.countDocuments()) === 0) {
    const p1 = await Product.create({ name: 'Widget A', price: 19.99, stock: 50, createdBy: admin._id });
    const p2 = await Product.create({ name: 'Widget B', price: 35.5, stock: 20, createdBy: alice._id });
    await Order.create({ ownerId: alice._id, productId: p1._id, quantity: 2, note: 'priority' });
    await Order.create({ ownerId: alice._id, productId: p2._id, quantity: 1, note: 'gift wrap' });
    console.log('[seed] products/orders seeded');
  }

  if ((await ImportLog.countDocuments()) === 0) {
    await ImportLog.create({
      source: 'seed',
      payload: { source: 'seed', items: [{ sku: 'W-A', qty: 10 }] },
      previewText: 'seed import entry',
      receivedBy: 'seed-script'
    });
    console.log('[seed] import logs seeded');
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
