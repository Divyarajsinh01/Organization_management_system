const { duration } = require('moment');
const { validateTime } = require('../utils/validation');

module.exports = (sequelize, Sequelize) => {
    const Lecture = sequelize.define('lectures', {
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
            }
        },
        standard_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'standards',
                key: 'standard_id'
            }
        },
        batch_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'batches',
                key: 'batch_id'
            }
        },
        subject_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'subjects',
                key: 'subject_id'
            }
        },
        start_time: {
            type: Sequelize.TIME
        },
        end_time: {
            type: Sequelize.TIME
        },
        // duration: {
        //     type: Sequelize.INTEGER,
        // }
    }, {
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ['start_time', 'end_time']
            },
            {
                fields: ['day', 'teacher_id', 'standard_id', 'subject_id', 'batch_id', 'start_time', 'end_time'],
            },
            {
                fields: ['day']
            }
        ]
    })

    return Lecture
};