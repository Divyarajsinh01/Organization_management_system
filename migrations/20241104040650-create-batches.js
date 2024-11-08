'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('batches', {
      batch_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      batch_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      batch_time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      standard_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'standards',
          key: 'standard_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('batches')
  }
};
