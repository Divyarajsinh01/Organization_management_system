'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organizations', {
      organization_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      organization_name: {
        type: Sequelize.STRING
      },
      logo: {
        type:  Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      organization_time: {
        type: Sequelize.STRING
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('organizations');
  }
};
