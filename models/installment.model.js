module.exports = (sequelize, Sequelize) => {
    const Installment = sequelize.define('installments', {
        installment_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fees_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'standardsFees',
                key: 'fees_id',
            }
        },
        installment_no: {
            type: Sequelize.INTEGER,
        },
        due_date: {
            type: Sequelize.DATEONLY
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2)
        }
    }, {
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ['due_date']
            }
        ]
    })

    return Installment
}