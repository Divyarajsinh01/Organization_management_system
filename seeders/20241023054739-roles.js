'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
      await queryInterface.bulkInsert('userRoles', [{
        role_id: 1,
        role: 'Super Admin'
      },{
        role_id: 2,
        role: 'Manager',
      },{
        role_id: 3,
        role: 'Teacher',
      },{
        role_id: 4,
        role: 'Student',
      }], {});
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userRoles', null, {});
  }
};
