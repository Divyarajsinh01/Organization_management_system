'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loginTokens', {
      token_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onDelete:  'CASCADE',
        onUpdate:  'CASCADE'
      },
      token:{
        type: Sequelize.STRING
      } 
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('loginTokens');
  }
};
