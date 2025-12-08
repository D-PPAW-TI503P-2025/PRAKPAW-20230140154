const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');

// Impor hanya 'authenticateToken' karena 'addUserData' tidak dipakai 
// (atau kamu sudah menggunakan token JWT yang asli)
const { authenticateToken } = require('../middleware/permissionMiddleware'); 

// --- ROUTES PRESENSI (Memerlukan otentikasi dan upload file) ---

// POST /api/presensi/check-in
// Urutan: Cek Token -> Upload File (Multer) -> Jalankan Controller
router.post('/check-in', 
  [authenticateToken, presensiController.upload.single('image')], 
  presensiController.CheckIn
);

// POST /api/presensi/check-out
// Urutan: Cek Token -> Upload File (Multer) -> Jalankan Controller
router.post('/check-out', 
  [authenticateToken, presensiController.upload.single('image')], 
  presensiController.CheckOut
);

// --- ROUTES Presensi (Otentikasi, tanpa file upload) ---

// DELETE /api/presensi/:id
router.delete("/:id", authenticateToken, presensiController.deletePresensi);

// PUT /api/presensi/:id
router.put("/:id", authenticateToken, presensiController.updatePresensi);


module.exports = router;