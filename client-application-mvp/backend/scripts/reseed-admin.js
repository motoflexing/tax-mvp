require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function reseed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const hash = await bcrypt.hash('admin123', 10);
  await conn.execute('DELETE FROM users WHERE email = ?', ['admin@taxmvp.com']);
  await conn.execute(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Admin', 'admin@taxmvp.com', hash, 'admin']
  );

  console.log('Admin reseeded successfully');
  console.log('Email: admin@taxmvp.com');
  console.log('Password: admin123');
  await conn.end();
}

reseed().catch(console.error);
