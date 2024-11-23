module.exports = (sequelize, Sequelize) => {
    const StudentAttendance = sequelize.define('student_attendances', {
        attendance_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        student_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'students',
                key: 'student_id'
            }
        },
        date: {
            type: Sequelize.DATEONLY
        },
        isAbsent: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        isNotificationSent: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
    },{
        timestamps: true,
        paranoid: true, // Enable soft delete behavior
        indexes: [
            {
                fields: ['date']
            },
            {
                fields: ['student_id', 'date']
            }
        ]
    })

    return StudentAttendance
}