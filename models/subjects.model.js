module.exports = (sequelize, Sequelize) => {
    const Subject = sequelize.define('subjects', {
        subject_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        subject_name: {
            type:  Sequelize.STRING,
            allowNull: false
        }
    },{
        timestamps: true,
        paranoid: true,
    })

    return Subject;
}