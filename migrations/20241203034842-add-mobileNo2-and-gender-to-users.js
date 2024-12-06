'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'mobileNo2', {
      type: Sequelize.STRING,
      allowNull: true
    })

    await queryInterface.addColumn('users','gender', {
      type: Sequelize.ENUM('Male', 'Female', 'Other'),
      allowNull: false
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'mobileNo2')
    await queryInterface.removeColumn('users', 'gender')
  }
};
