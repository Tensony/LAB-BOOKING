require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

bcrypt.hash('Admin@1234', 10).then(hash => {
  pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Admin', 'admin@zut.ac.zm', $1, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'admin'`,
    [hash]
  ).then(() => {
    console.log('✅ Admin created! Login with admin@zut.ac.zm / Admin@1234');
    process.exit(0);
  });
});