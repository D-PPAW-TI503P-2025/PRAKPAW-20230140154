const { SensorLog } = require('../models');

/**
 * ===============================
 * TERIMA DATA DARI ESP32
 * ===============================
 */
exports.receiveSensorData = async (req, res) => {
  try {
    const { suhu, kelembaban, cahaya, motion } = req.body;

    // Validasi
    if (suhu === undefined || kelembaban === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Data tidak valid"
      });
    }

    // Simpan ke database
    await SensorLog.create({
      suhu: parseFloat(suhu),
      kelembaban: parseFloat(kelembaban),
      cahaya: parseInt(cahaya) || 0,
      motion: motion ? 1 : 0   // ✅ TAMBAHAN
    });

    console.log(
      `💾 [SAVED] Suhu: ${suhu} | Lembab: ${kelembaban} | Cahaya: ${cahaya} | Motion: ${motion}`
    );

    res.status(201).json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ===============================
 * AMBIL RIWAYAT DATA SENSOR
 * (UNTUK GRAFIK REACT)
 * ===============================
 */
exports.getSensorHistory = async (req, res) => {
  try {
    const data = await SensorLog.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: "success",
      data: data.reverse()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};