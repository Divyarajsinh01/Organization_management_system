'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adding the 'name' column to the 'users' table
    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING,
      // allowNull: true, // You can specify whether the field should allow null values
    });
  },

  async down (queryInterface, Sequelize) {
    // Removing the 'name' column from the 'users' table (to revert the 'up' changes)
    await queryInterface.removeColumn('users', 'name');
  }
};
