const { where } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const {Subject, Standard, sequelize} = require('../models/index');
const ErrorHandler = require("../utils/errorHandler");

exports.addSubjects = catchAsyncError(async (req, res, next) => {
    const { standard_id, subjects } = req.body;

    if (!standard_id) {
        return next(new ErrorHandler('please provide standard', 400))
    }

    //subjects find and validation

    // const isSubject = await Subject.findOne({
    //     where: {subject_name}    
    // })

    // if(isSubject) {
    //     return next(new ErrorHandler('subject already exists', 400))
    // }

    // create subject

    // const subject = await Subject.create({
    //     subject_name
    // })

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return next(new ErrorHandler('Please provide subjects!', 400));
    }

    const isStandard = await Standard.findOne({ where: { standard_id } })

    if (!isStandard) {
        return next(new ErrorHandler('standard not found!', 400))
    }

    const transaction = await sequelize.transaction()

    try {
        const existingSubject = await Subject.findAll({
            where: { standard_id },
            transaction
        })

        // console.log(existingSubject)

        const existingSubjectNames = existingSubject.map(subject => subject.subject_name.toLowerCase())

        // Filter out subjects that already exist in the database
        const filterSubjects = subjects.filter(
            subject => !existingSubjectNames.includes(subject.subject_name.toLowerCase())
        );

        // console.log(filterSubjects)

        // console.log('Filtered subjects (without existing ones):', filterSubjects);

       filterSubjects.reduce((sub, subject) => {
        const subject_name = subject.subject_name
        if(sub.has(subject_name)){
            throw new ErrorHandler('Please provide unique subject!', 400)
        }

        sub.add(subject_name)

        return sub
       }, sub = new Set())

        if (filterSubjects.length === 0) {
            throw new ErrorHandler('Subject provided exist for Standard!')
        }

        const subjectData = filterSubjects.map(subject => ({
            standard_id,
            subject_name: subject.subject_name,  // Name of the subject
        }));

        // console.log(subjectData)
        // console.log(Object.keys(isStandard.__proto__));
        const subjectsData = await Subject.bulkCreate(subjectData, {transaction})

        await transaction.commit()

        res.status(200).json({
            success: true,
            message: 'subjects added successfully',
            data : subjectsData
        })

    } catch (error) {
        await transaction.rollback()
        return next(new ErrorHandler(error.message, 500))
    }
})

exports.getAllSubjects = catchAsyncError(async (req, res, next) => {
    const { standard_id } = req.body

    const subjectWhere = {}
    if (standard_id) {
        subjectWhere.standard_id = standard_id
    }
    const subjects = await Standard.findAll({  
        where: subjectWhere,
        include: [
            {
                model: Subject,
                as: 'subjects',
                required: true
            }
        ]
     })
    if (subjects.length <= 0) {
        return next(new ErrorHandler('Subjects data not available!', 400))
    }

    res.status(200).json({
        success: true,
        message: 'Subject fetched successfully!',
        data: subjects
    })
})

exports.updateSubjects = catchAsyncError(async (req, res, next) => {
    const { subject_id, subject_name } = req.body;
    if (!subject_id) {
        return next(new ErrorHandler('please provide subject id!', 400))
    }

    if (!subject_name) {
        return next(new ErrorHandler('please provide subject name!', 400))
    }

    const subject = await Subject.findOne({
        where: {
            subject_id
        }
    })

    if (!subject) {
        return next(new ErrorHandler('subject not found!', 400))
    }

    if (subject_name === subject.subject_name) {
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

exports.deleteSubjects = catchAsyncError(async (req, res, next) => {
    const { subject_id } = req.body;

    if (!subject_id) {
        return next(new ErrorHandler('please provide subject id!', 400))
    }

    const subject = await Subject.findOne({
        where: {
            subject_id
        }
    })

    if (!subject) {
        return next(new ErrorHandler('subject not found!', 400))
    }

    await subject.destroy()

    res.status(200).json({
        success: true,
        message: 'subject deleted successfully!'
    })
})
