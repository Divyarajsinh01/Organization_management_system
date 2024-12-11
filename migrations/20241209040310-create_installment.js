'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('installments', {
      installment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fees_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'standardsFees',
          key: 'fees_id',
        },
        onDelete: 'CASCADE', // Optional: Define cascade behavior on delete
        onUpdate: 'CASCADE', // Optional: Define cascade behavior on update
      },
      installment_no: {
        type: Sequelize.INTEGER,
      },
      due_date: {
        type: Sequelize.DATEONLY
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deletedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      }
    })

    await queryInterface.addIndex('installments', ['due_date'])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('installments', ['due_date']);
    await queryInterface.dropTable('installments')
  }
};
