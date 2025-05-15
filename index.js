const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const createDb = require('./db'); // Import database creation function

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const db = createDb(); // better-sqlite3 is synchronous

// API route to get all products
app.get('/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send('Internal Server Error');
  }
});

// API route to add a new product
app.post('/products', (req, res) => {
  const { name, stock, eta, expiry_date, is_new } = req.body;
  try {
    db.prepare(
      'INSERT INTO products (name, stock, eta, expiry_date, is_new) VALUES (?, ?, ?, ?, ?)'
    ).run(name, stock, eta, expiry_date, is_new);
    updateClients();
    res.sendStatus(201);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).send('Internal Server Error');
  }
});

// API route to update a product
app.put('/products/:id', (req, res) => {
  const { name, stock, eta, expiry_date, is_new } = req.body;
  try {
    db.prepare(
      'UPDATE products SET name = ?, stock = ?, eta = ?, expiry_date = ?, is_new = ? WHERE id = ?'
    ).run(name, stock, eta, expiry_date, is_new, req.params.id);
    updateClients();
    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).send('Internal Server Error');
  }
});

// API route to delete a product
app.delete('/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    updateClients();
    res.sendStatus(200);
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Emit real-time updates to connected clients
function updateClients() {
  const products = db.prepare('SELECT * FROM products').all();
  io.emit('update', products);
}

// Start the server
server.listen(4000, () => {
  console.log('Server running on port 4000');
});