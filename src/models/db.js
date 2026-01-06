// src/models/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Criar conexão com o MySQL
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
db.getConnection()
  .then(conn => {
    console.log("MySQL conectado na Railway");
    conn.release();
  })
  .catch(err => {
    console.error("Erro MySQL:", err);
  });

module.exports = db;
