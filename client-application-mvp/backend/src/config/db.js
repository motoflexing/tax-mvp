const mysql = require('mysql2/promise');
require('dotenv').config();

const dbPort = Number.parseInt(process.env.DB_PORT, 10);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.isInteger(dbPort) ? dbPort : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.on('connection', () => {
  console.log('MySQL connection established');
});

module.exports = pool;
