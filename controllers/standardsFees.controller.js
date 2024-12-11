const { where } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const db = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const Standard = db.Standard
const StandardFees = db.StandardFees

exports.addFeesToStandard = catchAsyncError(async (req, res, next) => {
    const { fees, standard_id, installments } = req.body;

    if (!fees || !standard_id) {
        return next(new ErrorHandler('Please fill in all fields', 400))
    }

    if (installments.length <= 0) {
        return next(new ErrorHandler('Please provide installments'))
    }

    const standard = await Standard.findByPk(standard_id);

    if (!standard) {
        return next(new ErrorHandler('Standard not found', 400))
    }

    const isFeesForStandard = await StandardFees.findOne({ where: { standard_id } })
    if (isFeesForStandard) {
        return next(new ErrorHandler('Fees already exists for this standard', 400))
    }

    const transaction = await db.sequelize.transaction()

    try {

        const newFees = await StandardFees.create({
            fees,
            standard_id
        }, {transaction})

        const installmentsRecords = []

        for(const installment of installments){
            const {installment_no, due_date, amount} = installment
            
            if(!installment_no || !due_date || !amount){
                throw new ErrorHandler('Please fill in all fields!', 400)
            }

            installmentsRecords.push({
                fees_id : newFees.fees_id,
                installment_no,
                due_date,
                amount
            })
        }

        const createdInstallments = await db.Installment.bulkCreate(installmentsRecords, {transaction})

        const students = await db.Student.findAll({
            where: {standard_id}
        })

        if(students.length > 0){
            const studentFeesRecord = []
            const studentInstallmentRecords = []

            for(const student of students){
                // console.log(student.student_id)
                studentFeesRecord.push({
                    fees_id: newFees.fees_id,
                    student_id: student.student_id,
                    pending_fees: fees,
                })

                for(const createdInstallment of createdInstallments){
                    studentInstallmentRecords.push({
                        installment_id: createdInstallment.installment_id,
                        student_id: student.student_id,
                    })
                }
            }

            await db.StudentFees.bulkCreate(studentFeesRecord, {transaction})
            
            await db.StudentPayment.bulkCreate(studentInstallmentRecords, {transaction})
        }

        await transaction.commit()

        res.status(200).json({
            success: true,
            message: 'Fees and Installment Added For Standard',
            // data: newFees
        })

    } catch (error) {
        await transaction.rollback()
        next(error instanceof ErrorHandler ? error : new ErrorHandler(error.message, 500))
    }
})

exports.getStandardsFeesList = catchAsyncError(async (req, res, next) => {

    const { standard_id } = req.body

    const standardWhere = {}

    if (standard_id) {
        standardWhere.standard_id = standard_id
    }

    const standards = await Standard.findAll({
        where: standardWhere,
        include: [{
            model: StandardFees,
            include: [
                {
                    model: db.Installment
                }
            ]
        }]
    })

    if (standards.length <= 0) {
        return next(new ErrorHandler('Standards fees data not found!', 400))
    }

    res.status(200).json({
        success: true,
        message: 'Standards fees fetched successfully!',
        data: standards
    })
})

exports.updateStandardsFees = catchAsyncError(async (req, res, next) => {
    const { fees, standard_id } = req.body;
    if (!fees) {
        return next(new ErrorHandler('please provide fees value!'))
    }

    if (!standard_id) {
        return next(new ErrorHandler('Please Provide standard id to update fees!', 400))
    }

    const standardsFees = await StandardFees.findOne({
        where: { standard_id }
    })


    if (!standardsFees) {
        return next(new ErrorHandler('Fees not available for standards', 400))
    }

    await standardsFees.update({
        fees
    })

    res.status(200).json({
        success: true,
        message: 'Fees Updated For Standard',
        data: standardsFees
    })
})

exports.deleteStandardsFees = catchAsyncError(async (req, res, next) => {
    const { standard_id } = req.body;

    if (!standard_id) {
        return next(new ErrorHandler('Please provide standard id to remove fees!'))
    }

    const standardsFees = await StandardFees.findOne({
        where: {
            standard_id
        }
    })

    if (!standardsFees) {
        return next(new ErrorHandler('Fees not available for standards', 400))
    }

    await standardsFees.destroy()

    res.status(200).json({
        success: true,
        message: 'standards fess deleted successfully!'
    })
})