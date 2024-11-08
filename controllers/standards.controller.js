const catchAsyncError = require("../middlewares/catchAsyncError");
const db = require('../models/index')
const Standard = db.Standard;
const Subject = db.Subject;
const ErrorHandler = require("../utils/errorHandler");

exports.addStandard = catchAsyncError(async (req, res, next) => {
    const { standard, subjectIDs } = req.body

    if (!standard) {
        return next(new ErrorHandler('please provide standard!', 400))
    }

    if (!subjectIDs || subjectIDs.length <= 0) {
        return next(new ErrorHandler('please provide subjects!', 400))
    }

    const isStandard = await Standard.findOne({ where: { standard } })

    if (isStandard) {
        return next(new ErrorHandler('standard already exists!', 400))
    }

    const isSubjects = await Subject.findAll({
        where: {subject_id:  subjectIDs}
    })

    if(subjectIDs.length !== isSubjects.length){
        return next(new ErrorHandler('One or more subjects do not exist!', 400))
    }

    const newStandard = await Standard.create({ standard })
    // console.log(Object.keys(newStandard.__proto__));
    await newStandard.addSubjects(subjectIDs)

    res.status(200).json({
        success: true,
        message: 'standard added successfully',
    })
})

exports.getAllStandardWithAssociatedSubjects = catchAsyncError(async (req, res, next) => {
    const standards = await Standard.findAll({
        include: [{
            model: Subject,
            through: {
                attributes: []
            }
        }]
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


exports.updateStandard = catchAsyncError(async (req, res, next) => {
    const { standard_id, standard, subjectIDs, removeSubjectIDs } = req.body;

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

    // If subject IDs are provided, update the associated subjects
    if (subjectIDs && subjectIDs.length > 0) {
        // Check if the provided subject IDs exist
        const isSubjects = await Subject.findAll({
            where: { subject_id: subjectIDs }
        });

        if (subjectIDs.length !== isSubjects.length) {
            return next(new ErrorHandler('One or more subjects do not exist!', 400));
        }

        // Add new associated subjects without removing existing ones
        await existingStandard.addSubjects(subjectIDs);
    }

        // If removeSubjectIDs are provided, manage the removal of subjects
        if (removeSubjectIDs && removeSubjectIDs.length > 0) {
            // Check if the subjects to be removed exist in the current association
            const currentSubjects = await existingStandard.getSubjects();
    
            const currentSubjectIds = currentSubjects.map(subject => subject.subject_id);
            const nonExistingRemovals = removeSubjectIDs.filter(id => !currentSubjectIds.includes(id));
    
            if (nonExistingRemovals.length > 0) {
                return next(new ErrorHandler('One or more subjects to remove do not exist in the current standard!', 400));
            }
    
            // Remove the subjects
            await existingStandard.removeSubjects(removeSubjectIDs);
        }

    res.status(200).json({
        success: true,
        message: 'Standard updated successfully!',
    });
});

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