const { where, Op } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { StudentFees, Student, StandardFees, User, Standard, Batch, StudentPayment, Installment, sequelize } = require("../models"); // Adjust the path as needed
const ErrorHandler = require("../utils/errorHandler");
const { validateDate } = require("../utils/validation");
const moment = require("moment");

exports.createStudentFeesRecords = catchAsyncError(async (req, res, next) => {
    const feesRecords = req.body.feesRecords; // Expecting an array of fee records

    if (!Array.isArray(feesRecords) || feesRecords.length === 0) {
        return next(new ErrorHandler('"Please provide an array of fee records to create.', 400))
    }

    const validatedRecords = [];

    // Validate and control data with a for loop
    for (const record of feesRecords) {
        const { student_id, fees_id, due_date, due_fees } = record;

        // Basic validation
        if (!student_id || !fees_id || !due_date || !due_fees) {
            return next(new ErrorHandler("Each fee record must include student_id, fees_id, due_date, and due_fees.", 400));
        }

        validateDate(due_date)
        const dueDateFormate = moment(due_date, 'DD/MM/YYYY').format('YYYY-MM-DD')

        const isStudent = await Student.findOne({ where: { student_id } })
        if (!isStudent) {
            return next(new ErrorHandler(`Student with id ${student_id} does not exist`, 404));
        }

        const isFees = await StandardFees.findOne({
            where: {
                fees_id,
                standard_id: isStudent.standard_id
            }
        })

        if (!isFees) {
            return next(new ErrorHandler(`Fees with id ${fees_id} does not exist for student`, 400))
        }

        const isRecordAlreadyExist = await StudentFees.findOne({ where: { student_id, fees_id } })

        if (isRecordAlreadyExist) {
            return next(new ErrorHandler(`Record for student id ${student_id} and fees id ${fees_id}`, 400))
        }

        // Push validated data to the array
        validatedRecords.push({
            student_id,
            fees_id,
            due_date: dueDateFormate,
            due_fees,
            pending_fees: isFees.fees
        });
    }

    // Insert all validated records at once using bulkCreate
    const createdRecords = await StudentFees.bulkCreate(validatedRecords);

    res.status(201).json({
        success: true,
        message: "Student fee records created successfully.",
        data: createdRecords
    });
});

exports.getStudentFeesRecordList = catchAsyncError(async (req, res, next) => {
    const { name, standard_id, batch_id, student_id, due_date, status } = req.body

    const studentWhere = {}
    const studentFeesWhere = {}
    const userWhere = {}

    if (name) {
        userWhere.name = { [Op.like]: `%${name}%` }
    }

    if (standard_id) {
        studentWhere.standard_id = standard_id
    }

    if (batch_id) {
        studentWhere.batch_id = batch_id
    }

    if (student_id) {
        studentWhere.student_id = student_id
    }

    if (due_date) {
        validateDate(due_date)
        const dueDateFormatted = moment(due_date, 'DD/MM/YYYY').format('YYYY-MM-DD')
        studentFeesWhere.due_date = { [Op.lte]: dueDateFormatted }
    }

    if (status) {
        studentFeesWhere.status = status
    }

    const studentFeesRecords = await Student.findAll({
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
                        model: StandardFees
                    }
                ]
            }
        ],
        // order: [[StudentFees, 'due_date', 'DESC']]
    })

    if (studentFeesRecords.length <= 0) {
        return next(new ErrorHandler('No student fees records found', 404))
    }

    res.status(200).json({
        status: 'success',
        message: 'Student fees records retrieved successfully',
        data: studentFeesRecords
    })
})

exports.getSingleStudentFeesRecord = catchAsyncError(async (req, res, next) => {
    const { student_id } = req.body

    // Start the transaction
    const transaction = await sequelize.transaction();

    try {
        const studentFees = await Student.findOne({
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
                {
                    model: StudentFees,
                    include: [
                        {
                            model: StandardFees
                        }
                    ]
                },
                {
                    model: StudentPayment,
                    include: [
                        {
                            model: Installment
                        }
                    ]
                }
            ],
            transaction
        })

        if (!studentFees) {
            return next(new ErrorHandler('Student not found', 400))
        }

        // Current date for comparison
        const currentDate = moment();

        const updateFeesStatus = studentFees.studentPayments.map(async (payment) => {
            const dueDate = moment(payment.installment.due_date, 'YYYY-MM-DD')
            // console.log(dueDate, currentDate)

            // If the status is already "upcoming", update it
            if (payment.installment_status === "upcoming") {
                let status = null;

                // Compare the current date with the due date
                if (currentDate.isSame(dueDate, 'day')) {
                    status = "due";  // Update to "due" if the current date matches the due date
                } else if (currentDate.isAfter(dueDate, 'day')) {
                    status = "over_due";  // Update to "over_due" if the current date is after the due date
                }

                // Only update if status was changed
                if (status) {
                    return payment.update(
                        { installment_status: status },
                        { transaction }  // Ensure the update is part of the transaction
                    );
                }
            }
        })

        // Wait for all promises to resolve
        await Promise.all(updateFeesStatus);

        // Commit the transaction if all updates are successful
        await transaction.commit();

        res.status(200).json({
            status: 'success',
            message: 'Student fees records retrieved successfully',
            data: studentFees
        })
    } catch (error) {
        await transaction.rollback()
        next(error instanceof ErrorHandler ? error : new ErrorHandler(error.message, 500))
    }
})
