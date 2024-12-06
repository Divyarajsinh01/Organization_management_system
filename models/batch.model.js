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
        // batch_time:{
        //     type: Sequelize.STRING,
        //     allowNull: false,
        // },
        batch_start_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        batch_end_time: {
            type: Sequelize.TIME,
            allowNull: false
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
            // {
            //     fields: ['batch_time']
            // },
            {
                fields: ['batch_start_time','batch_end_time']
            }
        ],
    })

    return Batch
};