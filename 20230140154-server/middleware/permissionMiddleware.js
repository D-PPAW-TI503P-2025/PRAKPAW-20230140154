const jwt = require('jsonwebtoken');

// Pastikan secret key sama dengan yang digunakan di authController.js
// IDEALNYA diambil dari environment variable (.env)
const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN'; 

// --- 1. FUNGSI AUTENTIKASI TOKEN (WAJIB DITAMBAHKAN) ---
exports.authenticateToken = (req, res, next) => {
    // Ambil token dari header Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    // Jika authHeader ada, ambil bagian tokennya (setelah 'Bearer ')
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if (token == null) {
        // 401 Unauthorized: Tidak ada token
        return res.status(401).json({ message: 'Token tidak ditemukan atau format salah. Silakan login.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // 403 Forbidden: Token tidak valid/expired
            return res.status(403).json({ message: 'Token tidak valid atau kedaluwarsa.' });
        }
        
        // Simpan data user yang sudah didecode ke req.user
        req.user = user;
        next(); // Lanjutkan ke middleware/controller berikutnya
    });
};

// --- 2. FUNGSI USER DUMMY (Opsional, untuk testing) ---
exports.addUserData = (req, res, next) => {
    console.log('Middleware: Menambahkan data user dummy...');
    req.user = {
      id: 123,
      nama: 'User Karyawan',
      role: 'admin' // Ganti role menjadi 'mahasiswa' untuk tes presensi
    };
    next(); 
};

// --- 3. FUNGSI OTORISASI ADMIN ---
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      console.log('Middleware: Izin admin diberikan.');
      next(); 
    } else {
      console.log('Middleware: Gagal! Pengguna bukan admin.');
      return res.status(403).json({ message: 'Akses ditolak: Hanya untuk admin'});
    }
};