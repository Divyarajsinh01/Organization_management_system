'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('student_attendances','isNotificationSent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })

    await queryInterface.addColumn('student_attendances', 'createdAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('student_attendances', 'updatedAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('student_attendances', 'deletedAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addIndex('student_attendances', ['date'])
    // await queryInterface.addIndex('student_attendances', ['student_id'])
    await queryInterface.addIndex('student_attendances', ['date', 'student_id'])

    await queryInterface.addColumn('holidays', 'createdAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('holidays', 'updatedAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('holidays', 'deletedAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addIndex('holidays', ['start_date', 'end_date'])
    await queryInterface.addIndex('holidays', ['start_date'])
    await queryInterface.addIndex('holidays', ['end_date'])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('student_attendances','isNotificationSent')
    await queryInterface.removeColumn('student_attendances', 'createdAt')
    await queryInterface.removeColumn('student_attendances', 'updatedAt')
    await queryInterface.removeColumn('student_attendances', 'deletedAt')
    await queryInterface.removeIndex('student_attendances', ['date'])
    // await queryInterface.removeIndex('student_attendances', ['student_id'])
    await queryInterface.removeIndex('student_attendances', ['date', 'student_id'])
    await queryInterface.removeColumn('holidays', 'createdAt')
    await queryInterface.removeColumn('holidays', 'updatedAt')
    await queryInterface.removeColumn('holidays', 'deletedAt')
    await queryInterface.removeIndex('holidays', ['start_date', 'end_date'])
    await queryInterface.removeIndex('holidays', ['start_date'])
    await queryInterface.removeIndex('holidays', ['end_date'])
  }
};
