module.exports = (sequelize, Sequelize) => {
    const Teacher = sequelize.define('teachers', {
        teacher_id: {
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
        }
    },{
        timestamps: false
    })

    return Teacher
}

