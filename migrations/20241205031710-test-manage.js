'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tests', 'description', {
      type: Sequelize.STRING,
      allowNull: false
    })

    await queryInterface.removeColumn('tests', 'duration')

    await queryInterface.removeColumn('lectures', 'duration')

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tests', 'description')
    await queryInterface.addColumn('tests', 'duration', {
      type: Sequelize.INTEGER,
    })
    await queryInterface.addColumn('lectures', 'duration', {
      type: Sequelize.INTEGER,
    })
  }
};
