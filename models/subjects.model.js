module.exports = (sequelize, Sequelize) => {
    const Subject = sequelize.define('subjects', {
        subject_id: {
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