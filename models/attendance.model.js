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
        }
    },{
        timestamps: false,
        // paranoid: true, // Enable soft delete behavior
    })

    return StudentAttendance
}