module.exports = (sequelize, Sequelize) => {
    const StandardFees = sequelize.define('standardsFees', {
        fees_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        standard_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'standards',
                key: 'standard_id'
            }
        },
        fees: {
            type: Sequelize.DECIMAL
        }
    },{
        timestamps: false
    })

    return StandardFees
}