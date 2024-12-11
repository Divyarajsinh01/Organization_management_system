module.exports = (sequelize, Sequelize) => {
    const StudentPayments = sequelize.define('studentPayments', {
        payment_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        installment_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'installments',
                key: 'installment_id'
            },
        },
        student_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'students',
                key: 'student_id'
            }
        },
        // student_fees_id: {                   // remove
        //     type: Sequelize.INTEGER,
        //     references: {
        //         model: 'studentFees',
        //         key: 'student_fees_id'
        //     },
        //     allowNull: false
        // },
        payment_date: {
            type: Sequelize.DATEONLY,
            allowNull: true
        },
        payment_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
        },
        due_fees: {
            type: Sequelize.DECIMAL(10, 2),
        },
        due_date: {
            type: Sequelize.DATEONLY,
        },
        installment_status: {
            type: Sequelize.ENUM('paid', 'partially_paid', 'over_due', 'due', 'upcoming'),
            defaultValue: 'upcoming'
        },
        approval_status: {               //rename to payment_status
            type: Sequelize.ENUM('pending', 'approved', 'rejected',),
            defaultValue: 'pending'
        }
    }, {
        timestamps: true,
        paranoid: true
    });

    return StudentPayments;
}