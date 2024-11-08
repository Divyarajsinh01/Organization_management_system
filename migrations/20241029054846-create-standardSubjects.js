'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('standardSubjects', {
      standard_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'standards',
          key: 'standard_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      subject_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'subjects',
          key: 'subject_id'
        },
        onDelete:  'CASCADE',
        onUpdate: 'CASCADE',
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('standardSubjects')
  }
};
