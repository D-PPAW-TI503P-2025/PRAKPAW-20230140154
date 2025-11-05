"use strict";

const { Presensi, sequelize } = require("../models");
const { format } = require("date-fns-tz");
const { Op, col, fn } = require("sequelize");
const timeZone = "Asia/Jakarta";

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let whereClause = {};

    // Filter berdasarkan nama
    if (nama) {
      whereClause.nama = { [Op.like]: `%${nama}%` };
    }

    // Filter tanggal (gunakan DATE agar hanya cek tanggal, bukan jam)
    if (tanggalMulai && tanggalSelesai) {
      whereClause = {
        ...whereClause,
        [Op.and]: [
          sequelize.where(fn("DATE", col("checkIn")), ">=", tanggalMulai),
          sequelize.where(fn("DATE", col("checkIn")), "<=", tanggalSelesai),
        ],
      };
    } else if (tanggalMulai) {
      whereClause = {
        ...whereClause,
        [Op.and]: [
          sequelize.where(fn("DATE", col("checkIn")), ">=", tanggalMulai),
        ],
      };
    } else if (tanggalSelesai) {
      whereClause = {
        ...whereClause,
        [Op.and]: [
          sequelize.where(fn("DATE", col("checkIn")), "<=", tanggalSelesai),
        ],
      };
    }

    // Ambil data presensi
    const records = await Presensi.findAll({
      where: whereClause,
      order: [["checkIn", "ASC"]],
    });

    // Format hasil
    const formattedData = records.map((record) => ({
      id: record.id,
      userId: record.userId,
      nama: record.nama,
      checkIn: record.checkIn
        ? format(record.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone })
        : null,
      checkOut: record.checkOut
        ? format(record.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone })
        : null,
    }));

    res.json({
      message: "Laporan presensi berhasil diambil.",
      total: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error getDailyReport:", error);
    res.status(500).json({
      message: "Gagal mengambil laporan presensi.",
      error: error.message,
    });
  }
};
