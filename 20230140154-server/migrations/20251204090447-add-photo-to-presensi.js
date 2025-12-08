'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Fungsi 'up' digunakan saat menjalankan migrasi (npx sequelize-cli db:migrate)
  async up (queryInterface, Sequelize) {
    // Menambahkan kolom 'buktiFoto' ke tabel 'Presensis' [cite: 55]
    await queryInterface.addColumn('Presensis', 'buktiFoto', {
      type: Sequelize.STRING, // Kita simpan path/nama filenya saja [cite: 56]
      allowNull: true         // Kolom diperbolehkan bernilai null [cite: 57]
    });
  },

  // Fungsi 'down' digunakan saat membatalkan migrasi (npx sequelize-cli db:migrate:undo)
  async down (queryInterface, Sequelize) {
    // Menghapus kolom 'buktiFoto' dari tabel 'Presensis'
    await queryInterface.removeColumn('Presensis', 'buktiFoto');
  }
};