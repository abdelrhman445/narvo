/**
 * Admin Seeder Script
 * Run ONCE to create the first super_admin account.
 *
 * Usage:
 *   node scripts/createAdmin.js
 *
 * Set these env vars before running:
 *   MONGO_URI, ADMIN_USERNAME, ADMIN_PASSWORD
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin');

const run = async () => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('❌ Set ADMIN_USERNAME and ADMIN_PASSWORD in your .env file');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be at least 8 characters');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`⚠️  Admin "${username}" already exists. Aborting.`);
    process.exit(0);
  }

  const admin = await Admin.create({ username, password, role: 'super_admin' });
  console.log(`✅ Admin created successfully!`);
  console.log(`   Username : ${admin.username}`);
  console.log(`   Role     : ${admin.role}`);
  console.log(`   ID       : ${admin._id}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
