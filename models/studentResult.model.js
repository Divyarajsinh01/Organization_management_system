module.exports = (sequelize, Sequelize) => {
    const StudentResult = sequelize.define('studentResults', {
        student_result_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        student_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'students',
                key: 'student_id'
            }
        },
        test_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'tests',
                key: 'test_id'
            }
        },
        obtained_marks: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    },{
        timestamps: false
    })

    return StudentResult
}