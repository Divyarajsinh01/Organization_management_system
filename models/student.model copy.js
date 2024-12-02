module.exports = (sequelize, Sequelize) => {
    const Student = sequelize.define('students', {
        student_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'user_id'
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
        organization_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'organizations',
                key: 'organization_id'
            }
        }
    },{
        timestamps: true,
        paranoid: true
    })

    return Student
}