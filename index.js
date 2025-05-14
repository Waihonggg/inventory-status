const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const createDb = require('./db');  // Import database creation function

const app = express();  // Initialize the express app
const server = http.createServer(app);  // Create HTTP server using express app
const io = new Server(server, { cors: { origin: '*' } });  // Initialize socket.io with CORS enabled

app.use(cors());  // Use CORS middleware for cross-origin requests
app.use(express.json());  // Middleware to parse JSON requests

let db;  // Declare the database variable

// Initialize the database connection
createDb().then((database) => {
  db = database;  // Assign the connected database to the db variable

  // API route to get all products
  app.get('/products', async (req, res) => {
    try {
      const products = await db.all('SELECT * FROM products');
      res.json(products);  // Send the products as JSON response
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).send('Internal Server Error');  // Error handling
    }
  });

  // API route to add a new product
  app.post('/products', async (req, res) => {
    const { name, stock, eta, expiry_date, is_new } = req.body;
    try {
      await db.run('INSERT INTO products (name, stock, eta, expiry_date, is_new) VALUES (?, ?, ?, ?, ?)', 
        [name, stock, eta, expiry_date, is_new]);
      updateClients();  // Notify clients about the update
      res.sendStatus(201);  // Return 201 status for successful creation
    } catch (err) {
      console.error('Error adding product:', err);
      res.status(500).send('Internal Server Error');  // Error handling
    }
  });

  // API route to update an existing product
  app.put('/products/:id', async (req, res) => {
    const { name, stock, eta, expiry_date, is_new } = req.body;
    try {
      await db.run('UPDATE products SET name = ?, stock = ?, eta = ?, expiry_date = ?, is_new = ? WHERE id = ?', 
        [name, stock, eta, expiry_date, is_new, req.params.id]);
      updateClients();  // Notify clients about the update
      res.sendStatus(200);  // Return 200 status for successful update
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).send('Internal Server Error');  // Error handling
    }
  });

  // API route to delete a product
  app.delete('/products/:id', async (req, res) => {
    try {
      await db.run('DELETE FROM products WHERE id = ?', req.params.id);
      updateClients();  // Notify clients about the update
      res.sendStatus(200);  // Return 200 status for successful deletion
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).send('Internal Server Error');  // Error handling
    }
  });

  // Function to notify clients about updates
  function updateClients() {
    db.all('SELECT * FROM products').then(products => {
      io.emit('update', products);  // Emit updated product data to all connected clients
    });
  }

  // Start the server
  server.listen(4000, () => console.log('Server running on port 4000'));  // Listen on port 4000
}).catch((err) => {
  console.error('Error initializing database:', err);  // Handle database connection errors
  process.exit(1);  // Exit process if database connection fails
});