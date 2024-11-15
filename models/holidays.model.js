module.exports = (sequelize, Sequelize) => {
    const Holiday = sequelize.define('holidays', {
        holiday_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        holiday_name: {
            type: Sequelize.STRING,
        },
        start_date: {
            type: Sequelize.DATEONLY
        },
        end_date: {
            type: Sequelize.DATEONLY
        }
    },{
        timestamps: false,
        // paranoid: true, // Enable soft delete behavior
    })

    return Holiday
}