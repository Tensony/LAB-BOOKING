const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'student',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS labs (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      location VARCHAR(200),
      capacity INTEGER NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS slots (
      id SERIAL PRIMARY KEY,
      lab_id INTEGER REFERENCES labs(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      max_bookings INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      slot_id INTEGER REFERENCES slots(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'pending',
      purpose TEXT,
      file_path TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Database tables initialized');
};

module.exports = { pool, initDB };
