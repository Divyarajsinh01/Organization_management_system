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
    }, {
        timestamps: true,
        paranoid: true, // Enable soft delete behavior
        indexes: [
            // Composite index on start_date and end_date for efficient range queries
            {
                fields: ['start_date', 'end_date']
            },
            // Optional: index on start_date if you filter queries based on just start_date
            {
                fields: ['start_date']
            },
            // Optional: index on end_date if you filter queries based on just end_date
            {
                fields: ['end_date']
            },
        ]
    })

    return Holiday
}