'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('studentPayments', 'installment_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'installments',
        key: 'installment_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })

    await queryInterface.addColumn('studentPayments', 'student_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'students',
        key: 'student_id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })

    await queryInterface.addColumn('studentPayments', 'due_date', {
      type: Sequelize.DATEONLY,
    })

    await queryInterface.addColumn('studentPayments', 'due_fees', {
      type: Sequelize.DECIMAL(10, 2),
    })

    await queryInterface.addColumn('studentPayments', 'installment_status', {
      type: Sequelize.ENUM('paid', 'partially_paid', 'over_due', 'due', 'upcoming'),
      defaultValue: 'upcoming'
    })

    await queryInterface.changeColumn('studentPayments', 'payment_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    })

    await queryInterface.changeColumn('studentPayments', 'payment_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    })

    await queryInterface.renameColumn('studentPayments', 'status', 'approval_status')

    await queryInterface.removeColumn('studentPayments', 'student_fees_id')

    // index add

    await queryInterface.addIndex('studentPayments', ['due_date']);
    await queryInterface.addIndex('studentPayments', ['installment_status']);
    await queryInterface.addIndex('studentPayments', ['approval_status']);
  },

  async down(queryInterface, Sequelize) {
    // remove index
    await queryInterface.removeIndex('studentPayments', ['due_date']);
    await queryInterface.removeIndex('studentPayments', ['installment_status']);
    await queryInterface.removeIndex('studentPayments', ['approval_status']);

    await queryInterface.removeColumn('studentPayments', 'installment_id')
    await queryInterface.removeColumn('studentPayments', 'student_id')
    await queryInterface.removeColumn('studentPayments', 'due_date')
    await queryInterface.removeColumn('studentPayments', 'due_fees')
    await queryInterface.removeColumn('studentPayments', 'installment_status')
    await queryInterface.renameColumn('studentPayments', 'approval_status', 'status')
    await queryInterface.addColumn('studentPayments', 'student_fees_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'studentFees',
        key: 'student_fees_id'
      },
      allowNull: false
    })

    await queryInterface.changeColumn('studentPayments', 'payment_date', {
      type: Sequelize.DATEONLY,
      allowNull: false
    })

    await queryInterface.changeColumn('studentPayments', 'payment_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    })
  }
};
