'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('studentFees', 'status', {
      type: Sequelize.ENUM('pending', 'fully_paid', 'partially_paid'),
      defaultValue: 'pending'
    })

    await queryInterface.removeColumn('studentFees', 'due_date')

    await queryInterface.removeColumn('studentFees', 'due_fees')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('studentFees', 'status', {
      type: Sequelize.ENUM('pending', 'fully_paid'),
      defaultValue: 'pending'
    })

    await queryInterface.addColumn('studentFees', 'due_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    })

    await queryInterface.addColumn('studentFees', 'due_fees', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    })
  }
};
