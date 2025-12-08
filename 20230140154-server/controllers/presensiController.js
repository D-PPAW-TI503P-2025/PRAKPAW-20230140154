// controllers/presensiController.js

const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

// --- Multer Configuration & File Handling ---
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Format nama file: userId-timestamp.jpg
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Multer error handling saat file bukan gambar
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false); 
  }
};

exports.upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Batasan ukuran file: 5MB
});
// --- End Multer Configuration ---

// Helper Function: Pengecek Validasi Tanggal
const isValidDate = (value) => !isNaN(Date.parse(value)); // <--- TAMBAH FUNGSI INI

// UPDATE FUNGSI CheckIn (Menerima file dan menyimpan path-nya)
exports.CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const { latitude, longitude } = req.body; 
    const waktuSekarang = new Date();
    
    // Ambil path file yang disimpan oleh Multer
    const buktiFoto = req.file ? req.file.path : null; 

    // Validasi Foto: Pastikan foto ada untuk presensi
    if (!buktiFoto) {
         return res.status(400).json({ message: "Foto wajib diambil untuk presensi." });
    }

    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      // Jika sudah ada, hapus foto yang baru diupload agar tidak menumpuk
      if (req.file) {
        fs.unlinkSync(req.file.path); 
      }
      return res
        .status(400)
        .json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    const newRecord = await Presensi.create({
      userId: userId,
      checkIn: waktuSekarang,
      latitude: latitude || null,
      longitude: longitude || null,
      buktiFoto: buktiFoto // Menyimpan path file
    });
    
    const formattedData = {
      userId: newRecord.userId,
      nama: userName,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: null,
      latitude: newRecord.latitude,
      longitude: newRecord.longitude,
      buktiFoto: newRecord.buktiFoto 
    };

    res.status(201).json({
      message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    console.error("ERROR CheckIn:", error); 
    // Tangani error Multer (misal: file terlalu besar, bukan gambar)
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: `Gagal Upload: ${error.message}` });
    }
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};


// UPDATE FUNGSI CheckOut (Tanpa update buktiFoto)
exports.CheckOut = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();
    
    // Hapus file yang diupload (jika ada) karena CheckOut biasanya tidak butuh bukti foto baru
    if (req.file) {
        fs.unlinkSync(req.file.path);
    }
    
    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
        return res.status(404).json({
            message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
        });
    }

    recordToUpdate.checkOut = waktuSekarang;
    
    await recordToUpdate.save();

    const formattedData = {
      userId: recordToUpdate.userId,
      nama: recordToUpdate.nama,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      latitude: recordToUpdate.latitude,
      longitude: recordToUpdate.longitude,
      buktiFoto: recordToUpdate.buktiFoto 
    };

    res.json({
      message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    console.error("ERROR CheckOut:", error); 
    if (req.file) {
        fs.unlinkSync(req.file.path); // Hapus file jika terjadi error DB
    }
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};


// UPDATE FUNGSI deletePresensi (Tambahkan logika hapus file fisik)
exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    if (recordToDelete.userId !== userId) {
      return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }

    // LOGIKA HAPUS FILE FISIK DARI FOLDER UPLOADS
    if (recordToDelete.buktiFoto && fs.existsSync(recordToDelete.buktiFoto)) {
        fs.unlinkSync(recordToDelete.buktiFoto);
    }
    // END LOGIKA HAPUS FILE

    await recordToDelete.destroy();

    res.status(200).json({ message: "Data berhasil dihapus." });
  } catch (error) {
    console.error("ERROR deletePresensi:", error); 
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};


exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut, nama, latitude, longitude } = req.body;

    // --- LOGIKA VALIDASI TANGGAL ---
    if (checkIn && !isValidDate(checkIn)) {
      return res.status(400).json({
        message: "Format tanggal checkIn tidak valid. perhatikan tanggalnya",
      });
    }

    if (checkOut && !isValidDate(checkOut)) {
      return res.status(400).json({
        message: "Format tanggal checkOut tidak valid. Gunakan format YYYY-MM-DD atau ISO8601.",
      });
    }
    // --- END LOGIKA VALIDASI TANGGAL ---

    if (
      checkIn === undefined &&
      checkOut === undefined &&
      nama === undefined &&
      latitude === undefined &&
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "Request body tidak berisi data yang valid untuk diupdate.",
      });
    }

    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    recordToUpdate.nama = nama || recordToUpdate.nama;
    recordToUpdate.latitude = latitude || recordToUpdate.updatePresensi;
    recordToUpdate.longitude = longitude || recordToUpdate.longitude;

    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    console.error("ERROR updatePresensi:", error); 
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};