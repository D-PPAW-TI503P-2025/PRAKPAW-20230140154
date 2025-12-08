const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Pastikan secret key dipindahkan ke .env nanti untuk keamanan
const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

exports.register = async (req, res) => {
  try {
    // 1. Ambil data dari body.
    let { nama, name, email, password, role } = req.body;

    if (!nama && name) {
      nama = name;
    }

    console.log("Mencoba Register dengan data:", { nama, email, role }); // Debugging Log

    // 2. Validasi input dasar
    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password harus diisi" });
    }

    // 3. Normalisasi Role 
    const roleFix = role ? role.toLowerCase() : 'mahasiswa';

    // 4. Validasi Role 
    if (!['mahasiswa', 'admin'].includes(roleFix)) {
      return res.status(400).json({ message: "Role tidak valid. Harus 'mahasiswa' atau 'admin'." });
    }

    // 5. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Buat User Baru
    const newUser = await User.create({
      nama,
      email,
      password: hashedPassword,
      role: roleFix
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      data: { id: newUser.id, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    console.error("🔥 ERROR REGISTER:", error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }
    
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      errorDetail: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan." });
    }

    // ========================================================
    // ======== DEBUGGING LOG UNTUK MENGIDENTIFIKASI MASALAH ========
    console.log("-----------------------------------------");
    console.log("ATTEMPTING LOGIN FOR:", email);
    console.log("Input Password (Plain):", password); 
    console.log("DB Hash:", user.password); 
    console.log("Panjang DB Hash:", user.password ? user.password.length : 0);
    // ========================================================

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Hasil bcrypt.compare (isMatch):", isMatch); // Hasil TRUE/FALSE

    if (!isMatch) {
      return res.status(401).json({ message: "Password salah." });
    }

    // Jika berhasil
    console.log("LOGIN BERHASIL!"); 
    
    const payload = {
      id: user.id,
      nama: user.nama,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({
      message: "Login berhasil",
      token: token,
      user: payload
    });

  } catch (error) {
    console.error("🔥 ERROR LOGIN:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};