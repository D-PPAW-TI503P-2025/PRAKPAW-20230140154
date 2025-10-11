const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Route utama
app.get('/', (req, res) => {
  res.send('Home Page for API');
});

// Import router dari folder routes
const bookRoutes = require('./routes/books.js'); // ← tambahkan .js biar pasti
app.use('/api/books', bookRoutes);

// Middleware 404 (Not Found)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Express server running at http://localhost:${PORT}/`);
});
