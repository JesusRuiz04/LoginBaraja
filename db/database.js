const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('usuarios.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    contraseña_haseada TEXT NOT NULL,
    ultimo_login TEXT
  )`);
});

module.exports = db;
