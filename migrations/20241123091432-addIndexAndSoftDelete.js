'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('batches', 'createdAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('batches', 'updatedAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('batches', 'deletedAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addIndex('batches', ['batch_name'])
    await queryInterface.addIndex('batches', ['batch_time'])

    await queryInterface.addColumn('lectures', 'createdAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('lectures', 'updatedAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('lectures', 'deletedAt', {
      type: Sequelize.DATE,
    })

    await queryInterface.addIndex('lectures', ['day', 'teacher_id', 'standard_id', 'subject_id', 'batch_id', 'start_time', 'end_time'], {
      name: 'idx_lectures_main_index'
    })

    await queryInterface.addIndex('lectures', ['start_time', 'end_time'])

    await queryInterface.addIndex('lectures', ['day'])

    await queryInterface.addColumn('managers', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('managers', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('managers', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('notifications', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('notifications', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('notificationTypes', 'createdAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('notificationTypes', 'updatedAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('notificationTypes', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('organizations', 'createdAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('organizations', 'updatedAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('organizations', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addIndex('organizations', ['organization_name', 'organization_time'])

    await queryInterface.addColumn('userRoles', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('userRoles', 'updatedAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('userRoles', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('standards', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('standards', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('standards', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('standardsFees', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('standardsFees', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('standardsFees', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('standardSubjects', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('standardSubjects', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('standardSubjects', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('students', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('students', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('students', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('studentFees', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('studentFees', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('studentFees', 'deletedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('studentPayments', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('studentPayments', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('studentPayments', 'deletedAt', {
      type: Sequelize.DATE
    })

    //studentResults

    await queryInterface.addColumn('studentResults', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('studentResults', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('studentResults', 'deletedAt', {
      type: Sequelize.DATE
    })

    //subjects

    await queryInterface.addColumn('subjects', 'createdAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('subjects', 'updatedAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('subjects', 'deletedAt', {
      type: Sequelize.DATE
    })

    //teachers
    await queryInterface.addColumn('teachers', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('teachers', 'updatedAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('teachers', 'deletedAt', {
      type: Sequelize.DATE
    })

    //teacherAssignments
    await queryInterface.addColumn('teacherAssignments', 'createdAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('teacherAssignments', 'updatedAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('teacherAssignments', 'deletedAt', {
      type: Sequelize.DATE
    })

    //tests
    await queryInterface.addColumn('tests', 'createdAt', {
      type: Sequelize.DATE
    })

    await queryInterface.addColumn('tests', 'updatedAt', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('tests', 'deletedAt', {
      type: Sequelize.DATE
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('batches', 'createdAt')
    await queryInterface.removeColumn('batches', 'updatedAt')
    await queryInterface.removeColumn('batches', 'deletedAt')
    await queryInterface.removeIndex('batches', ['batch_name'])
    await queryInterface.removeIndex('batches', ['batch_time'])
    await queryInterface.removeColumn('lectures', 'createdAt')
    await queryInterface.removeColumn('lectures', 'updatedAt')
    await queryInterface.removeColumn('lectures', 'deletedAt')
    await queryInterface.removeIndex('lectures', 'idx_lectures_main_index')
    await queryInterface.removeIndex('lectures', ['start_time', 'end_time'])
    await queryInterface.removeIndex('lectures', ['day'])
    await queryInterface.removeColumn('managers', 'createdAt')
    await queryInterface.removeColumn('managers', 'updatedAt')
    await queryInterface.removeColumn('managers', 'deletedAt')
    await queryInterface.removeColumn('notifications', 'updatedAt')
    await queryInterface.removeColumn('notifications', 'deletedAt')
    await queryInterface.removeColumn('notificationTypes', 'createdAt')
    await queryInterface.removeColumn('notificationTypes', 'updatedAt')
    await queryInterface.removeColumn('notificationTypes', 'deletedAt')
    await queryInterface.removeColumn('organizations', 'createdAt')
    await queryInterface.removeColumn('organizations', 'updatedAt')
    await queryInterface.removeColumn('organizations', 'deletedAt')
    await queryInterface.removeIndex('organizations', ['organization_name', 'organization_time'])
    await queryInterface.removeColumn('userRoles', 'createdAt')
    await queryInterface.removeColumn('userRoles', 'updatedAt')
    await queryInterface.removeColumn('userRoles', 'deletedAt')

    await queryInterface.removeColumn('standards', 'createdAt')
    await queryInterface.removeColumn('standards', 'updatedAt')
    await queryInterface.removeColumn('standards', 'deletedAt')
    await queryInterface.removeColumn('standardsFees', 'createdAt')
    await queryInterface.removeColumn('standardsFees', 'updatedAt')
    await queryInterface.removeColumn('standardsFees', 'deletedAt')

    await queryInterface.removeColumn('standardSubjects', 'createdAt')
    await queryInterface.removeColumn('standardSubjects', 'updatedAt')
    await queryInterface.removeColumn('standardSubjects', 'deletedAt')

    await queryInterface.removeColumn('students', 'createdAt')
    await queryInterface.removeColumn('students', 'updatedAt')
    await queryInterface.removeColumn('students', 'deletedAt')

    await queryInterface.removeColumn('studentFees', 'createdAt')
    await queryInterface.removeColumn('studentFees', 'updatedAt')
    await queryInterface.removeColumn('studentFees', 'deletedAt')

    await queryInterface.removeColumn('studentPayments', 'createdAt')
    await queryInterface.removeColumn('studentPayments', 'updatedAt')
    await queryInterface.removeColumn('studentPayments', 'deletedAt')

    await queryInterface.removeColumn('studentResults', 'createdAt')
    await queryInterface.removeColumn('studentResults', 'updatedAt')
    await queryInterface.removeColumn('studentResults', 'deletedAt')

    await queryInterface.removeColumn('subjects', 'createdAt')
    await queryInterface.removeColumn('subjects', 'updatedAt')
    await queryInterface.removeColumn('subjects', 'deletedAt')

    await queryInterface.removeColumn('teachers', 'createdAt')
    await queryInterface.removeColumn('teachers', 'updatedAt')
    await queryInterface.removeColumn('teachers', 'deletedAt')

    //teacherAssignments
    await queryInterface.removeColumn('teacherAssignments', 'createdAt')
    await queryInterface.removeColumn('teacherAssignments', 'updatedAt')
    await queryInterface.removeColumn('teacherAssignments', 'deletedAt')

    //tests
    await queryInterface.removeColumn('tests', 'createdAt')
    await queryInterface.removeColumn('tests', 'updatedAt')
    await queryInterface.removeColumn('tests', 'deletedAt')
  }
};
