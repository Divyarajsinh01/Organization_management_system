'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('batches', 'batch_start_time', {
      type: Sequelize.TIME,
      allowNull: false
    })

    await queryInterface.addColumn('batches', 'batch_end_time', {
      type: Sequelize.TIME,
      allowNull: false
    })

    await queryInterface.removeIndex('batches', ['batch_time'])

    await queryInterface.removeColumn('batches', 'batch_time')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('batches', 'batch_start_time')
    await queryInterface.removeColumn('batches', 'batch_end_time')
    await queryInterface.addColumn('batches', 'batch_time', {
      type: Sequelize.STRING,
      allowNull: false,
    })
    await queryInterface.addIndex('batches', ['batch_time'])
  }
};
