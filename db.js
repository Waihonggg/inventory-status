const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function createDb() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      stock INTEGER,
      eta TEXT,
      expiry_date TEXT,
      is_new BOOLEAN
    )
  `);

  return db;
}

module.exports = createDb;