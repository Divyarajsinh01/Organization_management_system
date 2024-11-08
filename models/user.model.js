const { hashPassword } = require("../utils/passwordUtils");
const { validEmail, validateMobileNumber, validPassword } = require("../utils/validation");

// Export the model
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
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
                model: 'userRoles', // Assuming you have a Role table
                key: 'role_id',
            },
            defaultValue: 1
        },
    }, {
        timestamps: false,
        hooks: {
            beforeCreate: async (user) => {
                validEmail(user.email);
                validateMobileNumber(user.mobileNo);
                validPassword(user.password);
                user.password = await hashPassword(user.password)
            },
            beforeUpdate: async (user) => {
                if (user.changed('email')) {
                    validEmail(user.email);
                }
                if (user.changed('mobileNo')) {
                    validateMobileNumber(user.mobileNo);
                }
                if (user.changed('password')) {
                    validPassword(user.password);
                    // Hash the password
                    user.password = await hashPassword(user.password);
                }
            },
        },
        indexes: [
            {
                unique: true,
                fields: ['login_id'], // Create a unique index on login_id
            },
        ],
    });
    
    return User
}