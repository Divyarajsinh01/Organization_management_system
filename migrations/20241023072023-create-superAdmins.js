'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      profile_image: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mobileNo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      login_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
      },
      role_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'userRoles', // This should match the table name of UserRole
          key: 'role_id',
        },
        onDelete: 'SET NULL', // Action to take on delete
        onUpdate: 'CASCADE', // Action to take on update
        defaultValue: 1
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
