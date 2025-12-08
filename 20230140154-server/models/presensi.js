'use strict';const {
  Model, DataTypes
} = require('sequelize');module.exports = (sequelize, DataTypes) => {
  class Presensi extends Model {
    /**
     * Definisikan relasi (Association)
     */
    static associate(models) {
      // Relasi: Presensi dimiliki oleh (belongsTo) User
      // Diperlukan agar ReportController bisa JOIN ke tabel Users
      Presensi.belongsTo(models.User, {
        foreignKey: 'userId', // Kunci asing di tabel Presensis
        as: 'user' // Alias yang digunakan saat Eager Loading (reportController.js)
      });
    }
  }
  Presensi.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Kolom 'nama' DIBIARKAN HILANG di model, karena sudah dihapus di Migrasi.
    // Namun, jika di database fisik masih ada dan NOT NULL, 
    // server akan menggunakan *workaround* dari presensiController.js.
    checkIn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Kolom lokasi (Modul 9)
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    // Kolom bukti foto (Modul 10)
    buktiFoto: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Presensi',
  });
  return Presensi;
};