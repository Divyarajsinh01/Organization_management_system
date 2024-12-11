const { Op } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { User, Teacher, TeacherAssignment, Standard, Subject, Batch, sequelize, UserRole } = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const { generateRandomPassword } = require("../utils/generateRandomPassword");
const generateLoginIdWithRandom = require("../utils/randomLoginIdGenerate");

exports.createTeacher = catchAsyncError(async (req, res, next) => {
    // request body
    const { name, email, mobileNo, address, mobileNo2, gender, standardDataWithSubjects } = req.body;

    // validation for all empty fields
    if (!name || !email || !mobileNo || !address || !gender) {
        return next(new ErrorHandler("Please fill all the fields", 400));
    }

    const role_id = 3; //Teacher default role id

    // role validation if exist on role table
    const role = await UserRole.findOne({ where: { role_id } });
    if (!role) return next(new ErrorHandler("Role not found", 404));

    // check if email or mobile number already exist
    const isTeacher = await User.findOne({
        where: {
            [Op.and]: [
                { email },
                { mobileNo }
            ]
        }
    });

    // if user already exist
    if (isTeacher) {
        return next(new ErrorHandler("This email or mobile number is already in use!", 400));
    }

    // generate random password
    // const randomPassword = generateRandomPassword();

    //random login id
    const login_id = await generateLoginIdWithRandom(role.role, User)

    // transaction start
    const transaction = await sequelize.transaction();

    try {
        const teacher = await User.create({
            name,
            email,
            mobileNo,
            mobileNo2: mobileNo2 || null,
            gender,
            password: 'Teacher@123', // default pass
            address,
            login_id,
            role_id
        }, { transaction });

        const newTeacher = await teacher.createTeacher({}, { transaction });

        const teacherAssignments = [];

        for (const standardData of standardDataWithSubjects) {
            const { standard_id, subject_ids, batches_ids } = standardData;

            const isStandard = await Standard.findOne({
                where: { standard_id }
            }, { transaction });

            if (!isStandard) {
                await transaction.rollback();
                return next(new ErrorHandler("Invalid standard id", 400));
            }

            const standardSubjects = await isStandard.getSubjects({
                where: { subject_id: subject_ids }
            }, { transaction });

            if (standardSubjects.length === 0) {
                await transaction.rollback();
                return next(new ErrorHandler("No subjects found for the given standard and subject ids", 400));
            }

            const standardBatches = await isStandard.getBatches({
                where: { batch_id: batches_ids }
            }, { transaction });

            if (standardBatches.length === 0) {
                await transaction.rollback();
                return next(new ErrorHandler('One or more batch ids are invalid', 400));
            }

            for (const subject_id of subject_ids) {
                for (const batch_id of batches_ids) {

                    // Check if the teacher assignment already exists
                    const existingAssignment = await TeacherAssignment.findOne({
                        where: {
                            teacher_id: newTeacher.teacher_id,
                            standard_id,
                            subject_id,
                            batch_id
                        }
                    }, { transaction });

                    if (existingAssignment) {
                        await transaction.rollback();
                        return next(new ErrorHandler(`Subject already assigned for this standard and batch`, 400));
                    }

                    teacherAssignments.push({
                        teacher_id: newTeacher.teacher_id,
                        standard_id,
                        subject_id,
                        batch_id
                    });
                }
            }
        }

        await TeacherAssignment.bulkCreate(teacherAssignments, { transaction });

        await transaction.commit();

        const createdTeacher = await Teacher.findOne({
            where: { user_id: teacher.user_id },
            include: [
                {
                    model: User,
                    attributes: { exclude: ['password'] }
                },
                {
                    model: TeacherAssignment,
                    include: [
                        { model: Standard },
                        { model: Subject },
                        { model: Batch }
                    ]
                }
            ]
        });

        const responseData = {
            teacher_id: createdTeacher.teacher_id,
            user_id: createdTeacher.user.user_id,
            name: createdTeacher.user.name,
            email: createdTeacher.user.email,
            login_id: createdTeacher.user.login_id,
            mobileNo: createdTeacher.user.mobileNo,
            mobileNo2: createdTeacher.user.mobileNo2,
            gender: createdTeacher.user.gender,
            address: createdTeacher.user.address,
            role_id: createdTeacher.user.role_id,
            assignStandard: []
        };

        const standardsMap = {};

        createdTeacher.teacherAssignments.forEach(assignment => {
            const { standard, batch, subject } = assignment;

            if (!standardsMap[standard.standard_id]) {
                standardsMap[standard.standard_id] = {
                    standard_id: standard.standard_id,
                    standard: standard.standard,
                    batches: {}
                };
            }

            if (!standardsMap[standard.standard_id].batches[batch.batch_id]) {
                standardsMap[standard.standard_id].batches[batch.batch_id] = {
                    batch_id: batch.batch_id,
                    batch_name: batch.batch_name,
                    batch_start_time: batch.batch_start_time,
                    batch_end_time: batch.batch_end_time,
                    subjects: []
                };
            }

            standardsMap[standard.standard_id].batches[batch.batch_id].subjects.push({
                subject_id: subject.subject_id,
                subject_name: subject.subject_name
            });
        });

        responseData.assignStandard = Object.values(standardsMap).map(standardData => ({
            standard_id: standardData.standard_id,
            standard: standardData.standard,
            batches: Object.values(standardData.batches)
        }));

        res.status(200).json({
            success: true,
            message: "Teacher created successfully",
            data: responseData
        });

    } catch (error) {
        await transaction.rollback();
        return next(new ErrorHandler(error.message, 400));
    }
});

exports.getTeacherList = catchAsyncError(async (req, res, next) => {
    // const { limit, page } = req.query;

    const teachersList = await Teacher.findAll({
        include: [{
            model: User,
            attributes: { exclude: ['password'] }
        }, {
            model: TeacherAssignment,
            // attributes: [],
            include: [
                { model: Standard },
                { model: Subject },
                { model: Batch }
            ]
        }]
    })

    const formattedTeachersList = teachersList.map((teacher) => {
        const responseData = {
            teacher_id: teacher.teacher_id,
            user_id: teacher.user.user_id,
            name: teacher.user.name,
            email: teacher.user.email,
            login_id: teacher.user.login_id,
            mobileNo: teacher.user.mobileNo,
            mobileNo2: createdTeacher.user.mobileNo2,
            gender: createdTeacher.user.gender,
            address: teacher.user.address,
            role_id: teacher.user.role_id,
            assignStandard: []
        };

        const standardsMap = {};

        teacher.teacherAssignments.forEach((assignment) => {
            const { standard, batch, subject } = assignment;

            if (!standardsMap[standard.standard_id]) {
                standardsMap[standard.standard_id] = {
                    standard_id: standard.standard_id,
                    standard: standard.standard,
                    batches: {}
                };
            }

            if (!standardsMap[standard.standard_id].batches[batch.batch_id]) {
                standardsMap[standard.standard_id].batches[batch.batch_id] = {
                    batch_id: batch.batch_id,
                    batch_name: batch.batch_name,
                    batch_start_time: batch.batch_start_time,
                    batch_end_time: batch.batch_end_time,
                    subjects: []
                };
            }

            standardsMap[standard.standard_id].batches[batch.batch_id].subjects.push({
                subject_id: subject.subject_id,
                subject_name: subject.subject_name
            });
        });

        responseData.assignStandard = Object.values(standardsMap).map((standardData) => ({
            standard_id: standardData.standard_id,
            standard: standardData.standard,
            batches: Object.values(standardData.batches)
        }));

        return responseData;
    });

    res.status(200).json({
        success: true,
        message: "Teacher list fetched successfully",
        data: formattedTeachersList
    })
})

exports.getTeacherProfile = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.user_id

    const teacher = await Teacher.findOne({
        where: { user_id: user_id },
        include: [
            {
                model: User,
                attributes: { exclude: ['password'] }
            },
            {
                model: TeacherAssignment,
                include: [
                    { model: Standard },
                    { model: Subject },
                    { model: Batch }
                ]
            }
        ]
    })

    // console.log(Object.getOwnPropertyNames(teacher.__proto__));

    if (!teacher) {
        return next(new ErrorHandler('Teacher not found!', 400))
    }

    const responseData = {
        teacher_id: teacher.teacher_id,
        user_id: teacher.user.user_id,
        name: teacher.user.name,
        email: teacher.user.email,
        // password: randomPassword,
        login_id: teacher.user.login_id,
        mobileNo: teacher.user.mobileNo,
        mobileNo2: createdTeacher.user.mobileNo2,
        gender: createdTeacher.user.gender,
        address: teacher.user.address,
        role_id: teacher.user.role_id,
        assignStandard: []
    };

    const standardsMap = {};

    teacher.teacherAssignments.forEach(assignment => {
        const { standard, batch, subject } = assignment;

        if (!standardsMap[standard.standard_id]) {
            standardsMap[standard.standard_id] = {
                standard_id: standard.standard_id,
                standard: standard.standard,
                batches: {}
            };
        }

        if (!standardsMap[standard.standard_id].batches[batch.batch_id]) {
            standardsMap[standard.standard_id].batches[batch.batch_id] = {
                batch_id: batch.batch_id,
                batch_name: batch.batch_name,
                batch_start_time: batch.batch_start_time,
                batch_end_time: batch.batch_end_time,
                subjects: []
            };
        }

        standardsMap[standard.standard_id].batches[batch.batch_id].subjects.push({
            subject_id: subject.subject_id,
            subject_name: subject.subject_name
        });
    });

    responseData.assignStandard = Object.values(standardsMap).map(standardData => ({
        standard_id: standardData.standard_id,
        standard: standardData.standard,
        batches: Object.values(standardData.batches)
    }));

    res.status(200).json({
        success: true,
        message: "Teacher profile fetched successfully",
        data: responseData
    })
})

exports.teacherUpdateByManager = catchAsyncError(async (req, res, next) => {
    const { teacher_id, addAssignments, removeAssignments } = req.body;

    if (!teacher_id) {
        return next(new ErrorHandler('Please provide teacher id!'))
    }

    const teacher = await Teacher.findOne({ where: { teacher_id } })
    if (!teacher) {
        return next(new ErrorHandler('Teacher not found!'))
    }

    const transaction = await sequelize.transaction();
    try {
        // Step 1: Add new assignments
        if (addAssignments && addAssignments.length > 0) {
            const newAssignments = addAssignments.map(({ standard_id, subject_id, batch_id }) => ({
                teacher_id,
                standard_id,
                subject_id,
                batch_id
            }));

            // Bulk insert new assignments
            await TeacherAssignment.bulkCreate(newAssignments, { transaction });
        }

        // Step 2: Remove specified assignments
        if (removeAssignments && removeAssignments.length > 0) {
            const removalConditions = removeAssignments.map(({ standard_id, subject_id, batch_id }) => ({
                teacher_id,
                standard_id,
                subject_id,
                batch_id
            }));

            // Delete specified assignments
            await TeacherAssignment.destroy({
                where: {
                    [Op.or]: removalConditions
                },
                transaction
            });
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: "Teacher assignments updated successfully"
        });
    } catch (error) {
        await transaction.rollback();
        return next(new ErrorHandler(error.message, 500));
    }
});
