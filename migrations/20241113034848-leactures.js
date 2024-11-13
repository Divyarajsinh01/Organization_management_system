'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lectures', {
      lecture_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      day: {
        type: Sequelize.ENUM,
        values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        allowNull: false
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'teachers',
          key: 'teacher_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      standard_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'standards',
          key: 'standard_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      batch_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'batches',
          key: 'batch_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      subject_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'subjects',
          key: 'subject_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      start_time: {
        type: Sequelize.TIME
      },
      end_time: {
        type: Sequelize.TIME
      },
      duration: {
        type: Sequelize.INTEGER,
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lectures')
  }
};
