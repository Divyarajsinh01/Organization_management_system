'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('studentFees', {
      student_fees_id: {
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
        }
      },
      fees_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'standardsFees',
          key: 'fees_id'
        }
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      due_fees: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      pending_fees: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'fully_paid'),
        defaultValue: 'pending'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('studentFees');
  }
};
