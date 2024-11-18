const { StudentFees, StudentPayment, Student, User, Standard, Batch,sequelize, Notification  } = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const moment = require("moment");
const { validateDate } = require("../utils/validation");

exports.studentPayFees = catchAsyncError(async (req, res, next) => {
    const { student_fees_id, payment_date, payment_amount, new_due_date_days } = req.body;
    const user = req.user; // Assuming user role comes from the authentication middleware

    // Validate input
    if (!student_fees_id || !payment_date || !payment_amount) {
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

        // Check if student_fees_id exists
        const studentFees = await StudentFees.findOne({ where: { student_fees_id } }, { transaction });
        if (!studentFees) {
            throw new ErrorHandler(`Student fee record with ID ${student_fees_id} does not exist.`, 404);
        }

        // Check if payment amount exceeds pending fees
        if (payment_amount > studentFees.pending_fees) {
            throw new ErrorHandler("Payment amount exceeds pending fees.", 400);
        }

        // Check if payment for the same date already exists
        const isPaymentAlready = await StudentPayment.findOne({ where: { student_fees_id, payment_date: formattedPaymentDate } }, { transaction });
        if (isPaymentAlready) {
            throw new ErrorHandler("Payment for this date already exists.", 400);
        }

        // Determine role-based behavior
        let paymentStatus = "pending"; // Default status
        let updatedPendingFees = studentFees.pending_fees;
        let newDueDate = studentFees.due_date; // Keep current due date unless updated

        if (user.role.role === "Super Admin") {
            paymentStatus = "approved";
            updatedPendingFees -= payment_amount; // Deduct payment amount from pending fees

            // Calculate the new due date (default to 30 days from payment date if not provided)
            const daysToAdd = new_due_date_days || 30; // Default 30 days
            newDueDate = moment(payment_date, "DD/MM/YYYY").add(daysToAdd, "days").format("YYYY-MM-DD");
        }

        // Create payment record
        const paymentRecord = await StudentPayment.create({
            student_fees_id,
            payment_date: formattedPaymentDate,
            payment_amount,
            status: paymentStatus,
        }, { transaction });

        // Update pending fees and due date only if payment is approved (by super admin)
        if (user.role.role === "Super Admin") {
            await StudentFees.update(
                {
                    pending_fees: updatedPendingFees,
                    due_date: newDueDate, // Update due date
                    status: updatedPendingFees === 0 ? "fully_paid" : "pending",
                },
                { where: { student_fees_id }, transaction }
            );

            await transaction.commit(); // Commit transaction
            return res.status(200).json({
                success: true,
                message: "Payment successfully processed by Super Admin.",
                payment: paymentRecord,
                updated_due_date: newDueDate,
            });
        } else if (user.role.role === "Manager") {
            const superAdmin = await User.findAll({ where: { role_id: 1 } }, { transaction });
            if (superAdmin.length === 0) {
                await transaction.rollback(); // Rollback transaction
                throw new ErrorHandler("No Super Admin found.", 404);
            }

            for (const admin of superAdmin) {
                await Notification.create({
                    user_id: admin.user_id,
                    notification_type_id: 4,
                    title: 'Payment request notification',
                    message: `Payment taken by ${user.name} with amount ${payment_amount}`,
                }, { transaction });
            }

            await transaction.commit(); // Commit transaction
            return res.status(200).json({
                success: true,
                message: "Payment request sent to Super Admin for approval.",
                payment: paymentRecord,
            });
        }
    } catch (error) {
        await transaction.rollback(); // Rollback transaction in case of error
        return next(error);
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