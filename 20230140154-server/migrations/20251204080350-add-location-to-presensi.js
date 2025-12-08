'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */

    // === Tambahan sesuai permintaan ===
    await queryInterface.addColumn('Presensis', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true
    });

    await queryInterface.addColumn('Presensis', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true
    });
    // ==================================
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     */

    // === Tambahan untuk rollback ===
    await queryInterface.removeColumn('Presensis', 'latitude');
    await queryInterface.removeColumn('Presensis', 'longitude');
    // ==================================
  }
};
