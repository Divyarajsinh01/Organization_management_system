const catchAsyncError = require("../middlewares/catchAsyncError");
const db = require('../models/index')
const Standard = db.Standard;
const Subject = db.Subject;
const ErrorHandler = require("../utils/errorHandler");

//add only standard
exports.addStandard = catchAsyncError(async (req, res, next) => {
    const { standard } = req.body

    if (!standard) {
        return next(new ErrorHandler('please provide standard!', 400))
    }

    const isStandard = await Standard.findOne({ where: { standard } })

    if (isStandard) {
        return next(new ErrorHandler('standard already exists!', 400))
    }

    const transaction = await db.sequelize.transaction()

    try {
        const newStandard = await Standard.create({ standard }, {transaction})

        await transaction.commit()
        res.status(200).json({
            success: true,
            message: 'standard and subjects added successfully',
            data: newStandard
        })
        
    } catch (error) {
        await transaction.rollback()
        return next(new ErrorHandler(error.message, 500))
    }
})

// add standard with subjects 
// exports.addStandard = catchAsyncError(async (req, res, next) => {
//     const { standard, subjects } = req.body

//     if (!standard) {
//         return next(new ErrorHandler('please provide standard!', 400))
//     }

//     if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
//         return next(new ErrorHandler('Please provide subjects!', 400));
//     }

//     const isStandard = await Standard.findOne({ where: { standard } })

//     if (isStandard) {
//         return next(new ErrorHandler('standard already exists!', 400))
//     }

//     const transaction = await db.sequelize.transaction()

//     try {
//         const newStandard = await Standard.create({ standard }, {transaction})
//         const subjectData = subjects.map(subject => ({
//             standard_id: newStandard.standard_id, // Associate with the new standard
//             subject_name: subject.subject_name,  // Name of the subject
//         }));
//         // console.log(Object.keys(newStandard.__proto__));
//         await Subject.bulkCreate(subjectData, {transaction})
//         res.status(200).json({
//             success: true,
//             message: 'standard and subjects added successfully',
//         })
        
//     } catch (error) {
//         await transaction.rollback()
//         return next(new ErrorHandler(error.message, 500))
//     }
// })

// get all standards only 
exports.getAllStandardWithAssociatedSubjects = catchAsyncError(async (req, res, next) => {
    const standards = await Standard.findAll({
        // include: {
        //     model: Subject,
        //     // required: true
        // }
    })

    if(standards.length <= 0){
        return next(new ErrorHandler('no standards found!', 400))
    }

    res.status(200).json({
        success: true,
        message: 'standard fetch successfully!',
        data: standards
    })
})

// update standard
exports.updateStandard = catchAsyncError(async (req, res, next) => {
    const { standard_id, standard} = req.body;

    // Check if standard_id is provided
    if (!standard_id) {
        return next(new ErrorHandler('Please provide the standard ID!', 400));
    }

    // Check if the standard exists
    const existingStandard = await Standard.findByPk(standard_id);
    if (!existingStandard) {
        return next(new ErrorHandler('Standard not found!', 404));
    }

    // Update the standard name if provided
    if (standard) {
        existingStandard.standard = standard;
        await existingStandard.save();
    }

    res.status(200).json({
        success: true,
        message: 'Standard updated successfully!',
    });
});

// delete standard
exports.deleteStandard = catchAsyncError(async (req, res, next) => {
    const {standard_id} = req.body

    if(!standard_id){
        return next(new ErrorHandler('Please provide a standard ID', 400))
    }

    const standard = await Standard.findOne({
        where: { standard_id }
    })

    if(!standard){
        return next(new ErrorHandler('Standard not found', 400))
    }

    await standard.destroy()
    res.status(200).json({
        success: true,
        message: 'Standard deleted successfully!'
    })
})