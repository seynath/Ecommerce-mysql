const mysql = require('mysql2/promise');
//dotenv
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  // connectionLimit: 10 // number of connections you want to allow at once
});

const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query("SELECT 1");
    connection.release();
    console.log('Database connection established');
  } catch (err) {
    console.error('Error checking MySQL connection:', err);
    throw err;
  }
};

module.exports = { pool, checkConnection };
