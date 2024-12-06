'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('subjects', 'standard_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'standards',
        key: 'standard_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('subjects', 'standard_id')
  }
};
