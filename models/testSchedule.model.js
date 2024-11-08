module.exports = ( sequelize, Sequelize ) => {
    const Test = sequelize.define('tests', {
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
                key:  'subject_id'
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
        startTime:{
            type: Sequelize.TIME
        },
        endTime:{
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
    },{
        timestamps: false,
        indexes: [
            {
                name: 'test_schedule_index',
                fields: ['standard_id', 'subject_id', 'batch_id', 'date', 'endTime']
            }
        ]
    })

    return Test
}