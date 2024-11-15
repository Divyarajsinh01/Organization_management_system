'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('holidays', {
      holiday_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      holiday_name: {
        type: Sequelize.STRING,
      },
      start_date: {
        type: Sequelize.DATEONLY
      },
      end_date: {
        type: Sequelize.DATEONLY
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('holidays');
  }
};
