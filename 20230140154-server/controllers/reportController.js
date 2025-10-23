"use strict";

const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const { Op } = require("sequelize");
const timeZone = "Asia/Jakarta";

exports.getDailyReport = async (req, res) => {
  try {
    // Ambil tanggal hari ini (zona waktu Asia/Jakarta)
    const today = format(new Date(), "yyyy-MM-dd", { timeZone });

    // Hitung awal dan akhir hari (00:00:00 - 23:59:59)
    const startOfDay = new Date(`${today}T00:00:00`);
    const endOfDay = new Date(`${today}T23:59:59`);

    // Ambil data dari database menggunakan Sequelize
    const dailyData = await Presensi.findAll({
      where: {
        checkIn: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [["checkIn", "ASC"]],
    });

    // Format hasil untuk dikirim ke response
    const formattedData = dailyData.map((record) => ({
      id: record.id,
      userId: record.userId,
      nama: record.nama,
      checkIn: format(record.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: record.checkOut
        ? format(record.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone })
        : null,
    }));

    // Kirim hasil ke client
    res.json({
      message: `Laporan presensi tanggal ${today}`,
      total: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error("❌ Error getDailyReport:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil laporan presensi",
      error: error.message,
    });
  }
};
