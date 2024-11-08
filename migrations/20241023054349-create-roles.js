'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('userRoles', {
      role_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      role: {
        type: Sequelize.STRING
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('userRoles');
  }
};
