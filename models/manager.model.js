const { validateTimeFormat } = require("../utils/validation");


module.exports = (sequelize, Sequelize) => {
    const Manager = sequelize.define('managers', {
        manager_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'user_id'
            }    
        },
        timing: {
            type: Sequelize.STRING
        }
    },{
        timestamps: true,
        paranoid: true,
        hooks: {
            beforeCreate: (manager) => {
                validateTimeFormat(manager.timing)
            },
            beforeUpdate:  (manager) => {
                validateTimeFormat(manager.timing)
            }
        }
    })

    return Manager;
};