const catchAsyncError = require("../middlewares/catchAsyncError");
const db = require('../models/index');
const Subject = db.Subject;
const ErrorHandler = require("../utils/errorHandler");

exports.addSubjects = catchAsyncError(async(req, res, next) => {
    const { subject_name} = req.body;

    if(!subject_name){
        return next(new ErrorHandler('please provide subject_name', 400))
    }

    const isSubject = await Subject.findOne({
        where: {subject_name}    
    })

    if(isSubject) {
        return next(new ErrorHandler('subject already exists', 400))
    }

    const subject = await Subject.create({
        subject_name
    })

    res.status(200).json({
        success: true,
        message: 'Subject added successfully',
        data: subject
    })
})

exports.getAllSubjects = catchAsyncError(async (req, res, next) => {
    const subjects = await Subject.findAll()
    if(subjects.length <= 0){
        return next(new ErrorHandler('Subjects data not available!', 400))
    }

    res.status(200).json({
        success: true,
        message: 'Subject fetched successfully!',
        data: subjects
    })
})

exports.updateSubjects = catchAsyncError(async (req, res, next) => {
    const { subject_id, subject_name} = req.body;
    if(!subject_id){
        return next(new ErrorHandler('please provide subject id!', 400))
    }

    if(!subject_name){
        return next(new ErrorHandler('please provide subject name!', 400))
    }

    const subject = await Subject.findOne({
        where: {
            subject_id
        }
    })

    if(!subject){
        return next(new ErrorHandler('subject not found!', 400))
    }

    if(subject_name === subject.subject_name){
        return next(new ErrorHandler('subject name already exists!', 400))
    }

    await subject.update({
        subject_name
    })

    res.status(200).json({
        success: true,
        message: 'standard updated successfully!',
        data: subject
    })
})

exports.deleteSubjects  = catchAsyncError(async (req, res, next) => {
    const { subject_id } = req.body;

    if(!subject_id){
        return next(new ErrorHandler('please provide subject id!', 400))
    }

    const subject  = await Subject.findOne({
        where:{
            subject_id
        }
    })

    if(!subject){
        return next(new ErrorHandler('subject not found!', 400))
    }

    await subject.destroy()

    res.status(200).json({
        success: true,
        message: 'subject deleted successfully!'
    })
})
