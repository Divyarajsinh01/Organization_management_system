'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('organizations', 'organization_start_time', {
      type: Sequelize.TIME,
    })

    await queryInterface.addColumn('organizations', 'organization_end_time', {
      type: Sequelize.TIME,
    })

    await queryInterface.removeIndex('organizations', ['organization_name', 'organization_time'])

    await queryInterface.removeColumn('organizations', 'organization_time')

    await queryInterface.addIndex('organizations', ['organization_name', 'organization_start_time', 'organization_end_time'], {
      name: 'organization_idx'
    })

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('organizations', 'organization_idx')
    await queryInterface.addColumn('organizations', 'organization_time', {
      type: Sequelize.STRING,
    })
    await queryInterface.addIndex('organizations', ['organization_name', 'organization_time'])

    await queryInterface.removeColumn('organizations', 'organization_start_time')
    await queryInterface.removeColumn('organizations', 'organization_end_time')
  }
};
