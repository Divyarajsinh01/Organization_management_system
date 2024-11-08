'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tests', {
      test_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      standard_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'standards',
          key: 'standard_id'
        }
      },
      subject_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'subjects',
          key: 'subject_id'
        }
      },
      batch_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'batches',
          key: 'batch_id'
        }
      },
      topic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      startTime: {
        type: Sequelize.TIME,
      },
      endTime: {
        type: Sequelize.TIME
      },
      duration: {
        type: Sequelize.INTEGER,
      },
      marks: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM,
        values: ['completed', 'pending', 'marks_not_assign'],
        defaultValue: 'pending'
      }
    });

     // Adding an index to the 'Tests' table on 'standard_id', 'subject_id', 'batch_id', 'date', and 'endTime'
     await queryInterface.addIndex('tests', ['standard_id', 'subject_id', 'batch_id', 'date','startTime', 'endTime'], {
      name: 'test_schedule_index', // Custom name for the index
      unique: false // Set to `true` if you want this index to be unique
    });
  },

  
  async down(queryInterface, Sequelize) {
    // Drop the foreign key constraints first
    // await queryInterface.removeConstraint('tests', 'standard_id'); // Remove standard_id foreign key
    // await queryInterface.removeConstraint('tests', 'subject_id'); // Remove subject_id foreign key
    // await queryInterface.removeConstraint('tests', 'batch_id'); // Remove batch_id foreign key
    // Remove the index if you are rolling back the migration
    // await queryInterface.removeIndex('tests', 'test_schedule_index');
    await queryInterface.dropTable('tests');
  }
};
