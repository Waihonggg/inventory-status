const Database = require('better-sqlite3');

function createDb() {
  const db = new Database('./database.db');

  db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      stock INTEGER,
      eta TEXT,
      expiry_date TEXT,
      is_new BOOLEAN
    )
  `).run();

  return db;
}

module.exports = createDb;