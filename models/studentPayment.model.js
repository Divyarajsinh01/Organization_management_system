module.exports = (sequelize, Sequelize) => {
    const StudentPayments = sequelize.define('studentPayments', {
        payment_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        student_fees_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'studentFees',
                key: 'student_fees_id'
            },
            allowNull: false
        },
        payment_date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        payment_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected',),
            defaultValue: 'pending'
        }
    }, {
        timestamps: false
    });

    return StudentPayments;
}