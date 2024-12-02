module.exports = (sequelize, Sequelize) => {
    const TeacherAssignment = sequelize.define('teacherAssignments', {
        teacher_assignment_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
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
        }
    },{
        timestamps: true,
        paranoid: true
    })

    return TeacherAssignment
}

