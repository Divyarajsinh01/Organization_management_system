const { StudentFees, StudentPayment, Student, User, Standard, Batch, sequelize, Notification, Installment } = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const moment = require("moment");
const { validateDate } = require("../utils/validation");

exports.studentPayFees = catchAsyncError(async (req, res, next) => {
    const { installment_id, student_id, payment_date, payment_amount, newDueDate } = req.body;
    const user = req.user; // Assuming user role comes from the authentication middleware

    // Validate input
    if (!installment_id || !student_id || !payment_date || !payment_amount) {
        return next(new ErrorHandler("Please provide student_fees_id, payment_date, and payment_amount.", 400));
    }

    if (payment_amount <= 0) {
        return next(new ErrorHandler("Payment amount must be greater than zero.", 400));
    }

    // Start a transaction
    const transaction = await sequelize.transaction();
    try {
        // Validate date
        validateDate(payment_date);
        const formattedPaymentDate = moment(payment_date, "DD/MM/YYYY").format("YYYY-MM-DD");

        // Check if installment exists
        const isInstallment = await Installment.findOne({ where: { installment_id }, transaction })

        if (!isInstallment) {
            throw new ErrorHandler('no installment found!')
        }

        const isStudent = await Student.findOne({
            where: { student_id },
            include: [
                {
                    model: User,
                    attributes: { exclude: ['password'] }
                },
                {
                    model: Standard,
                },
                { model: Batch },
            ],
            transaction
        })
        if (!isStudent) {
            throw new ErrorHandler('no student found!', 400)
        }

        const paymentRecord = await StudentPayment.findOne({ where: { installment_id, student_id }, transaction })

        if (!paymentRecord) {
            throw new ErrorHandler('no installment record found for student!',400)
        }

        if (paymentRecord.installment_status === "paid") {
            throw new ErrorHandler("Installment already fully paid!", 400);
        }

        const studentFeesRecord = await StudentFees.findOne({ where: { student_id, fees_id: isInstallment.fees_id } })

        if (!studentFeesRecord) {
            throw new ErrorHandler('no fees found for student', 400)
        }

        // Determine role-based behavior
        // let updatedPendingFees = studentFeesRecord.pending_fees;
        // console.log(updatedPendingFees, studentFeesRecord.status)
        let installmentAmount = paymentRecord.due_fees || isInstallment.amount
        // console.log((parseFloat(paymentRecord.payment_amount) || 0) + payment_amount)
        // Check if payment exceeds the total due for this installment
        if (payment_amount > installmentAmount) {
            throw new ErrorHandler("Payment amount exceeds the installment due amount.", 400);
        }

        // Update the payment record old code
        // if (payment_amount < installmentAmount) {
        //     paymentRecord.installment_status = 'partially_paid'
        //     paymentRecord.payment_date = formattedPaymentDate
        //     paymentRecord.payment_amount = (parseFloat(paymentRecord.payment_amount) || 0) + payment_amount
        //     paymentRecord.due_date = newDueDate ? newDueDate : paymentRecord.due_date
        //     paymentRecord.due_fees = installmentAmount - payment_amount
        //     // Update pending fees in StudentFees (reduce by the payment_amount, but not below 0)

        //     studentFeesRecord.pending_fees = Math.max(0, studentFeesRecord.pending_fees - payment_amount);
        //     studentFeesRecord.status = studentFeesRecord.pending_fees === 0 ? "fully_paid" : "pending"
        // }else{
        //     paymentRecord.installment_status = 'paid'
        //     paymentRecord.payment_date = formattedPaymentDate
        //     paymentRecord.payment_amount = (parseFloat(paymentRecord.payment_amount) || 0) + payment_amount
        //     paymentRecord.due_date = null
        //     paymentRecord.due_fees = 0
        //     studentFeesRecord.pending_fees = Math.max(0, studentFeesRecord.pending_fees - payment_amount);
        //     studentFeesRecord.status = studentFeesRecord.pending_fees === 0 ? "fully_paid" : "pending"
        // }

        // Update payment record new code
        const newPaymentAmount = (parseFloat(paymentRecord.payment_amount) || 0) + payment_amount;
        const newDueFees = installmentAmount - payment_amount;

        paymentRecord.payment_date = formattedPaymentDate;
        paymentRecord.payment_amount = newPaymentAmount;
        paymentRecord.due_fees = newDueFees;

        if (newDueFees > 0) {
            if (!newDueDate) {
                throw new ErrorHandler('due date is required for partially paid installment', 400)
            }
            validateDate(newDueDate)
            const formattedDueDate = moment(newDueDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
            // Partial Payment
            paymentRecord.installment_status = "partially_paid";
            paymentRecord.due_date = formattedDueDate || paymentRecord.due_date; // Keep or update due date
        } else {
            // Full Payment
            paymentRecord.installment_status = "paid";
            paymentRecord.due_date = null; // Clear due date
        }

        // Update student fees record
        studentFeesRecord.pending_fees = Math.max(0, studentFeesRecord.pending_fees - payment_amount);
        studentFeesRecord.status = studentFeesRecord.pending_fees === 0 ? "fully_paid" : "pending";

        await paymentRecord.save({ transaction });
        await studentFeesRecord.save({ transaction });

        if (user.role_id === 2) {
            const superAdmin = await User.findAll({ where: { role_id: 1 }, transaction });
            const notifications = superAdmin.map(admin => ({
                user_id: admin.user_id,
                notification_type_id: 4,
                title: "Payment notification",
                message: `Payment received: ${user.name} collected ₹${payment_amount} from ${isStudent.user.name} (Standard: ${isStudent.standard.standard}, Batch: ${isStudent.batch.name}). Payment Date: ${formattedPaymentDate}.`,
            }));
            
            await Notification.bulkCreate(notifications, { transaction });
        }

        await transaction.commit(); // Commit transaction
        res.status(200).json({
            success: true,
            message: "Payment successfully received!",
        });
    } catch (error) {
        await transaction.rollback(); // Rollback transaction in case of error
        return next(error instanceof ErrorHandler ? error : new ErrorHandler(error.message, 500));
    }
});

exports.getStudentPayFeesList = catchAsyncError(async (req, res, next) => {
    const { name, standard_id, batch_id, student_id, due_date, fees_status, payment_status } = req.body

    const studentWhere = {}
    const studentFeesWhere = {}
    const userWhere = {}
    const studentPaymentWhere = {}

    if (name) {
        userWhere.name = { [Op.like]: `%${name}%` }
    }

    if (standard_id) {
        studentWhere.standard_id = standard_id
    }

    if (batch_id) {
        studentFeesWhere.batch_id = batch_id
    }

    if (student_id) {
        studentWhere.student_id = student_id
    }

    if (due_date) {
        validateDate(due_date)
        const dueDateFormatted = moment(due_date, 'DD/MM/YYYY').format('YYYY-MM-DD')
        studentFeesWhere.due_date = { [Op.lte]: dueDateFormatted }
    }

    if (fees_status) {
        studentFeesWhere.status = fees_status
    }

    if (payment_status) {
        studentPaymentWhere.status = payment_status
    }

    const studentFeesHistory = await Student.findAll({
        where: studentWhere,
        include: [
            {
                model: User,
                where: userWhere,
                attributes: { exclude: ['password'] }
            },
            {
                model: Standard,
            },
            { model: Batch },
            {
                model: StudentFees,
                where: studentFeesWhere,
                include: [
                    {
                        model: StudentPayment,
                        where: studentPaymentWhere
                    }
                ]
            }
        ],
    })


    if (studentFeesHistory.length <= 0) {
        return next(new ErrorHandler('No student fees history found', 404))
    }

    res.status(200).json({
        status: 'success',
        message: 'Student fees history retrieved successfully',
        data: studentFeesHistory
    })
})

exports.studentFeesPaymentApproveBySuperAdmin = catchAsyncError(async (req, res, next) => {
    const { payment_id, payment_status, new_due_date_days } = req.body

    if (!payment_id) {
        return next(new ErrorHandler('Please provide payment id', 400))
    }

    if (!payment_status) {
        return next(new ErrorHandler('Please provide payment status', 400))
    }

    const studentPayment = await StudentPayment.findOne({
        where: { payment_id }
    })

    if (!studentPayment) {
        return next(new ErrorHandler('No student payment found', 400))
    }

    // Prevent status change if already approved
    if (studentPayment.status === "approved") {
        return next(
            new ErrorHandler("Payment is already approved and cannot be changed.", 400)
        );
    }

    const studentFees = await StudentFees.findOne({
        where: { student_fees_id: studentPayment.student_fees_id }
    })

    let studentPendingFess = studentFees.pending_fees
    let newDueDate = studentFees.due_date;

    // Calculate the new due date (default to 30 days from payment date if not provided)
    const daysToAdd = new_due_date_days || 30; // Default 30 days
    newDueDate = moment(studentPayment.payment_date).add(daysToAdd, "days")

    await studentPayment.update({
        status: payment_status
    })

    if (payment_status === 'approved') {
        studentPendingFess -= studentPayment.payment_amount
        await studentFees.update({
            pending_fees: studentPendingFess,
            due_date: newDueDate, // Update due date
            status: studentPendingFess === 0 ? "fully_paid" : "pending",
        })
    }

    res.status(200).json({
        success: true,
        message: `Student payment ${payment_status} successfully!`
    })
})