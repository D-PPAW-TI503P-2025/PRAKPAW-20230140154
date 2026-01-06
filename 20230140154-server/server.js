const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;
const morgan = require("morgan");
const path = require('path'); // Mengimpor modul path

// Impor router
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");
const authRoutes = require('./routes/auth');
const ruteBuku = require("./routes/books"); 
const ruteBuku = require("./routes/iot");// Pastikan ini diimpor sebelum digunakan

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --- KONFIGURASI STATIC FILE SERVING UNTUK UPLOAD ---
// Agar file yang diupload di folder 'uploads' dapat diakses via URL /uploads
// [cite: 61, 63]
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// --------------------------------------------------

// Middleware logging kustom
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Home Page for API");
});

// Definisi Routes Utama
app.use("/api/books", ruteBuku);
app.use("/api/presensi", presensiRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/iot', iotRoutes);

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});