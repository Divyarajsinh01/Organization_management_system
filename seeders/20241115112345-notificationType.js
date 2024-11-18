'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('notificationTypes', [{
      notification_type_id: 1,
      notification_type: 'simple message'
    }, {
      notification_type_id: 2,
      notification_type: 'Attendance',
    }, {
      notification_type_id: 3,
      notification_type: 'Mark message',
    }, {
      notification_type_id: 4,
      notification_type: 'Student fees approve',
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('notificationTypes', null, {});
  }
};
