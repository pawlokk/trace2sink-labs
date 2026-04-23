const mongoose = require('mongoose');
const env = require('./env');

async function connectDb() {
  await mongoose.connect(env.mongoUri);
  console.log(`[db] connected to ${env.mongoUri}`);
}

module.exports = { connectDb };
