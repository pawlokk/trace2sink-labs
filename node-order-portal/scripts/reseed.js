const { connectDb } = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const ImportLog = require('../src/models/ImportLog');

async function run() {
  await connectDb();
  await Promise.all([
    Order.deleteMany({}),
    Product.deleteMany({}),
    ImportLog.deleteMany({}),
    User.deleteMany({})
  ]);
  console.log('[reseed] collections cleared');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
