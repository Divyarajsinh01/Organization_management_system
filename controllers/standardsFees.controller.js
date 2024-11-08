const catchAsyncError = require("../middlewares/catchAsyncError");
const db = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const Standard = db.Standard
const StandardFees = db.StandardFees

exports.addFeesToStandard = catchAsyncError(async (req, res, next) => {
    const { fees, standard_id } = req.body;

    if (!fees || !standard_id) {
        return next(new ErrorHandler('Please fill in all fields', 400))
    }

    const standard = await Standard.findByPk(standard_id);

    if (!standard) {
        return next(new ErrorHandler('Standard not found', 400))
    }

    const isFeesForStandard = await StandardFees.findOne({ where: { standard_id } })
    if (isFeesForStandard) {
        return next(new ErrorHandler('Fees already exists for this standard', 400))
    }

    const newFees = await StandardFees.create({
        fees,
        standard_id
    })

    res.status(200).json({
        success: true,
        message: 'Fees Added For Standard',
        data: newFees
    })
})

exports.getStandardsFeesList = catchAsyncError(async (req, res, next) => {
    const standards = await Standard.findAll({
        include: [{ 
            model: StandardFees,
            required: true
        }]
    })

    if(standards.length <= 0){
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
    if(!fees){
        return next(new ErrorHandler('please provide fees value!'))
    }

    if(!standard_id){
        return next(new ErrorHandler('Please Provide standard id to update fees!', 400))
    }

    const standardsFees = await StandardFees.findOne({
        where: {standard_id}
    })


    if(!standardsFees){
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

    if(!standard_id){
        return next(new ErrorHandler('Please provide standard id to remove fees!'))
    }

    const standardsFees = await StandardFees.findOne({
        where: {
            standard_id
        }
    })

    if(!standardsFees){
        return  next(new ErrorHandler('Fees not available for standards', 400))
    }

    await standardsFees.destroy()

    res.status(200).json({
        success: true,
        message: 'standards fess deleted successfully!'
    })
})