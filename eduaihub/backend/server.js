const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = require('./src/app');
const Admin = require('./src/models/Admin');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const port = Number(process.env.PORT || 5000);

const ensureDefaultAdmin = async () => {
  const shouldSeed = process.env.SEED_DEFAULT_ADMIN !== 'false';
  if (!shouldSeed) {
    return;
  }

  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'test@email.com').trim().toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';

  if (!email || !password) {
    return;
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({ email, password: hashedPassword });
  console.log(`Default admin created for local login: ${email}`);
};

if (!mongoUri) {
  console.error('Missing MongoDB connection string. Set MONGODB_URI (or MONGO_URI) in backend/.env.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log('MongoDB connected');
    await ensureDefaultAdmin();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start backend:', err.message);
    process.exit(1);
  });
