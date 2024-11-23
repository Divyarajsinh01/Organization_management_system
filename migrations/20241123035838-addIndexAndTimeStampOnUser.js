'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'createdAt',{
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('users', 'updatedAt',{
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('users', 'deletedAt',{
      type: Sequelize.DATE,
    })

    await queryInterface.addIndex('users', ['email', 'mobileNo'])

    await queryInterface.addIndex('users', ['email'])

    await queryInterface.addIndex('users', ['mobileNo'])

    await queryInterface.addIndex('users', ['name'])
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.removeColumn('users', 'createdAt')
   await queryInterface.removeColumn('users', 'updatedAt')
   await queryInterface.removeColumn('users', 'deletedAt')
   await queryInterface.removeIndex('users', ['email', 'mobileNo'])
   await queryInterface.removeIndex('users', ['email'])
   await queryInterface.removeIndex('users', ['mobileNo'])
   await queryInterface.removeIndex('users', ['name'])
  }
};
