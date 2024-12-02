const { validateTime } = require('../utils/validation');

module.exports = (sequelize, Sequelize) => {
    const Batch  = sequelize.define('batches', {
        batch_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        batch_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        batch_time:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        standard_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'standards',
                key: 'standard_id'
            }
        }
    },{
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                // unique: true,
                fields: ['batch_name']
            },
            {
                fields: ['batch_time']
            }
        ],
        hooks: {
            beforeCreate: (batch, options) => {
                validateTime(batch.batch_time)
            },
            beforeUpdate: (batch) => {
                validateTime(batch.batch_time)
            }
        }
    })

    return Batch
};