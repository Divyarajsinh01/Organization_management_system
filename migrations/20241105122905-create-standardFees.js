'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('standardsFees', {
        fees_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        standard_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'standards',
                key: 'standard_id'
            }
        },
        fees: {
            type: Sequelize.DECIMAL
        }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('standardsFees');
  }
};
