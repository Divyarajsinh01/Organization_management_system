'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('studentResults', {
      student_result_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      student_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'students',
          key: 'student_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      test_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tests',
          key: 'test_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      obtained_marks: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('studentResults');
  }
};
