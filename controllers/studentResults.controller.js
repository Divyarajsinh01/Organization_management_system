const { where } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { Student, StudentResult, Test, Sequelize, User, Subject, Standard, Batch, sequelize, Notification, UserFCM } = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const { validateDate } = require("../utils/validation");
const { Op } = Sequelize;
const moment = require('moment');
const sendPushNotification = require("../utils/sendPushNotification");

// Function to calculate average marks for each student
const calculateAverageMarks = (students) => {
    // If the input is a single student object, wrap it in an array
    const studentsArray = Array.isArray(students) ? students : [students];

    return studentsArray.map((student) => {
        const totalMarks = student.studentResults.length
            ? student.studentResults.reduce((acc, mark) => acc + mark.test.marks, 0)
            : 0;

        const totalObtainedMarks = student.studentResults.length
            ? student.studentResults.reduce((sum, result) => sum + result.obtained_marks, 0)
            : 0;

        const percentage = totalMarks > 0 ? (totalObtainedMarks / totalMarks) * 100 : 0;

        return {
            ...student.toJSON(),
            totalMarks,
            totalObtainedMarks,
            percentage,
        };
    });
};

exports.addStudentMarks = catchAsyncError(async (req, res, next) => {
    const { studentMarks, test_id, isNotify } = req.body;

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
        const userMessages = []; // Array to collect notification messages

        for (const { student_id, obtained_marks } of studentMarks) {
            // Check if required fields are present
            if (!student_id || !test_id || obtained_marks === undefined) {
                return next(new ErrorHandler('Please fill all the fields', 400));
            }

            // Find the student record
            const student = await Student.findOne({
                where: { student_id },
                include: [{
                    model: User,
                    include: [
                        {
                            model: UserFCM
                        }
                    ]
                }]
            }, { transaction });
            if (!student) {
                await transaction.rollback();
                return next(new ErrorHandler('Student not found', 404));
            }

            // Find the test record
            const test = await Test.findOne({
                where: { test_id },
                include: [{
                    model: Subject,
                    as: 'subjects'
                }]
            }, { transaction });
            if (!test) {
                await transaction.rollback();
                return next(new ErrorHandler('Test not found', 404));
            }

            // Validate `obtained_marks` against `total_marks`
            if (obtained_marks > test.marks) {
                await transaction.rollback();
                return next(
                    new ErrorHandler(
                        `Obtained marks (${obtained_marks}) cannot be greater than total marks (${test.total_marks}) for test_id ${test_id}.`,
                        400
                    )
                );
            }

            // Check if the student's standard and batch match the test's standard and batch
            if (student.standard_id !== test.standard_id || student.batch_id !== test.batch_id) {
                await transaction.rollback();
                return next(new ErrorHandler('The test does not belong to the same standard and batch as the student', 400));
            }

            // Check if marks are already assigned for this student and test
            const existingResult = await StudentResult.findOne({
                where: {
                    student_id,
                    test_id
                }
            });

            if (existingResult) {
                await transaction.rollback();
                // If marks are already assigned, skip creating/updating the record
                return next(new ErrorHandler(`Marks for student_id ${student_id} and test_id ${test_id} are already assigned`, 400));
            }

            // Create or update the StudentResult record with obtained marks
            await StudentResult.upsert({
                student_id,
                test_id,
                obtained_marks
            }, { transaction });

            await test.update({
                status: 'completed'
            }, { transaction })

            // **Prepare notification data if isNotify is true**
            if (isNotify) {
                userMessages.push({
                    title: `Marks Message!`,
                    message: `Dear ${student.user.name}, you have scored ${obtained_marks} marks in ${test.subjects.subject_name} on ${test.date}. Keep up the good work!`,
                    user_id: student.user.user_id,
                    notification_type_id: 3
                });

                if(student.user.usersFCMTokens.length > 0){
                    const studentNotification = student.user.usersFCMTokens.map(t => sendPushNotification(`Marks Message!`,
                        `Dear ${student.user.name}, you have scored ${obtained_marks} marks in ${test.subjects.subject_name} on ${test.date}. Keep up the good work!`,
                        t.FCM_Token
                    ))
    
                    await Promise.all(studentNotification)
                }

            }
        }

        // **Save notifications to the database if isNotify is true**
        if (isNotify && userMessages.length > 0) {
            // console.log(test_id)
            await Notification.bulkCreate(userMessages, { transaction });

            // Update the test record's notificationSent field after processing all students
            await Test.update({
                isNotificationSent: true
            }, { where: { test_id }, transaction });
        }

        await transaction.commit()

        res.status(200).json({
            success: true,
            message: isNotify ? "Student marks have been added and notifications sent successfully." : "Student marks have been added successfully"
        });
    } catch (error) {
        await transaction.rollback()
        return next(new ErrorHandler(error.message, 400));
    }
});

exports.getStudentMarks = catchAsyncError(async (req, res, next) => {
    const { login_id, student_id, standard_id, batch_id, subject_ids, from_date, to_date } = req.body;

    validateDate(from_date);
    validateDate(to_date)

    const startDate = moment(from_date, 'DD/MM/YYYY').format('YYYY-MM-DD')
    const endDate = moment(to_date, 'DD/MM/YYYY').format('YYYY-MM-DD')

    // Initialize filter options for students and tests
    const whereConditions = {};
    const testConditions = {};
    const userWhere = {}

    // Apply filters if provided
    if (student_id) whereConditions.student_id = student_id;
    if (standard_id) whereConditions.standard_id = standard_id;
    if (batch_id) whereConditions.batch_id = batch_id;

    if (subject_ids && subject_ids.length > 0) testConditions.subject_id = { [Op.in]: subject_ids };

    // Handle date range filtering
    if (from_date && to_date) {
        testConditions.date = {
            [Op.between]: [startDate, endDate]
        };
    } else if (from_date) {
        testConditions.date = {
            [Op.gte]: startDate
        };
    } else if (to_date) {
        testConditions.date = {
            [Op.lte]: endDate
        };
    }

    if (login_id) {
        userWhere.login_id = login_id
    }

    // Query Student table with related StudentResults and Tests
    const studentsWithMarks = await Student.findAll({
        where: whereConditions,  // Filters based on student data
        include: [
            {
                model: User,
                where: userWhere,
                attributes: { exclude: ['password'] },
            },
            {
                model: Standard
            },
            {
                model: Batch
            },
            {
                model: StudentResult,
                required: true,
                include: [
                    {
                        model: Test,  // Include tests for aggregation
                        where: testConditions,  // Apply test filters
                        required: true,
                        include: [
                            {
                                model: Subject,
                                as: 'subjects'
                            }
                        ],
                        order: ['date', 'ASC']
                    },
                ],
            }
        ],
        order: [['student_id', 'ASC']]  // Order results by student ID
    });

    // Check if results are found
    if (!studentsWithMarks.length) {
        return next(new ErrorHandler("No marks found!", 404));
    }

    const studentResultData = calculateAverageMarks(studentsWithMarks)

    // Send the aggregated data (total and average marks)
    res.status(200).json({
        success: true,
        message: "Student marks fetched successfully!",
        data: studentResultData
    });
});

exports.getTop10Students = catchAsyncError(async (req, res, next) => {
    const { standard_id, batch_id, subject_ids, from_date, to_date } = req.body;

    validateDate(from_date);
    validateDate(to_date)

    const startDate = moment(from_date, 'DD/MM/YYYY').format('YYYY-MM-DD')
    const endDate = moment(to_date, 'DD/MM/YYYY').format('YYYY-MM-DD')

    // Initialize filter options for students and tests
    const whereConditions = {};
    const testConditions = {};

    // Apply filters if provided
    if (standard_id) whereConditions.standard_id = standard_id;
    if (batch_id) whereConditions.batch_id = batch_id;

    if (subject_ids && subject_ids.length > 0) testConditions.subject_id = { [Op.in]: subject_ids };

    // Handle date range filtering
    if (from_date && to_date) {
        testConditions.date = {
            [Op.between]: [startDate, endDate]
        };
    } else if (from_date) {
        testConditions.date = {
            [Op.gte]: startDate
        };
    } else if (to_date) {
        testConditions.date = {
            [Op.lte]: endDate
        };
    }

    // Query Student table with related StudentResults and Tests
    const studentsWithMarks = await Student.findAll({
        where: whereConditions,  // Filters based on student data
        include: [
            {
                model: User,
                attributes: { exclude: ['password'] },
            },
            {
                model: Standard
            },
            {
                model: Batch
            },
            {
                model: StudentResult,
                required: true,
                include: [
                    {
                        model: Test,  // Include tests for aggregation
                        where: testConditions,  // Apply test filters
                        required: true,
                        include: [
                            {
                                model: Subject,
                                as: 'subjects'
                            }
                        ],
                        order: ['date', 'ASC']
                    },
                ],
            }
        ],
        order: [['student_id', 'ASC']]  // Order results by student ID
    });

    // Check if results are found
    if (!studentsWithMarks.length) {
        return next(new ErrorHandler("No marks found for the given filters", 404));
    }


    // Calculate average marks for each student
    const studentResultData = calculateAverageMarks(studentsWithMarks);

    // Sort students by average marks in descending order
    const top10Students = studentResultData.sort((a, b) => b.totalObtainedMarks - a.totalObtainedMarks).slice(0, 10);

    // Send the aggregated data (top 10 students with their average marks)
    res.status(200).json({
        success: true,
        message: "Top 10 students fetched successfully!",
        data: top10Students
    });
});

exports.getStudentsProgressReport = catchAsyncError(async (req, res, next) => {
    const { user_id } = req.user; // Assume user_id is from JWT or session
    // console.log(user_id)
    const { standard_id, batch_id, subject_ids, from_date, to_date } = req.body;

    validateDate(from_date);
    validateDate(to_date);

    const startDate = moment(from_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const endDate = moment(to_date, 'DD/MM/YYYY').format('YYYY-MM-DD');

    // Initialize filter options for students and tests
    const whereConditions = { user_id };
    const testConditions = {};

    // Apply filters if provided
    if (standard_id) whereConditions.standard_id = standard_id;
    if (batch_id) whereConditions.batch_id = batch_id;
    if (subject_ids && subject_ids.length > 0) testConditions.subject_id = { [Op.in]: subject_ids };

    // Handle date range filtering
    if (from_date && to_date) {
        testConditions.date = {
            [Op.between]: [startDate, endDate],
        };
    } else if (from_date) {
        testConditions.date = {
            [Op.gte]: startDate,
        };
    } else if (to_date) {
        testConditions.date = {
            [Op.lte]: endDate,
        };
    }

    // Fetch students along with results, tests, and subjects
    const studentsWithProgress = await Student.findAll({
        where: whereConditions, // Filter by logged-in user
        include: [
            {
                model: User
            },
            {
                model: Standard,
            },
            {
                model: Batch
            },
            {
                model: StudentResult,
                required: true,
                include: [
                    {
                        model: Test,  // Include tests for aggregation
                        where: testConditions,  // Apply test filters
                        required: true,
                        include: [
                            {
                                model: Subject,
                                as: 'subjects'
                            }
                        ],
                        order: ['date', 'ASC']
                    },
                ],
            }
        ]
    });

    // Check if students were found
    if (!studentsWithProgress || studentsWithProgress.length === 0) {
        return next(new ErrorHandler('No students found', 404));
    }

    // Calculate total and average marks for each student
    const studentsProgress = calculateAverageMarks(studentsWithProgress);

    // Send the progress data
    res.status(200).json({
        success: true,
        message: 'Students progress reports fetched successfully!',
        data: studentsProgress,
    });
});

exports.updateStudentMarks = catchAsyncError(async (req, res, next) => {
    const { student_id, test_id, obtained_marks } = req.body;

    // Check if required fields are present
    if (!student_id || !test_id || obtained_marks === undefined) {
        return next(new ErrorHandler('Please fill all the fields', 400));
    }

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
        // Find the student record
        const student = await Student.findOne({
            where: { student_id },
            include: [{ model: User ,
                include: [
                    {
                        model: UserFCM
                    }
                ]
            }],
            transaction // Include transaction to lock the query
        });
        if (!student) {
            throw new ErrorHandler('Student not found', 404);
        }

        // Find the test record
        const test = await Test.findOne({
            where: { test_id },
            include: [{
                model: Subject,
                as: 'subjects'
            }],
            transaction
        });
        if (!test) {
            throw new ErrorHandler('Test not found', 404);
        }

        // Validate student's standard and batch against the test
        if (student.standard_id !== test.standard_id || student.batch_id !== test.batch_id) {
            throw new ErrorHandler(
                'The test does not belong to the same standard and batch as the student',
                400
            );
        }

        // Check if the marks entry already exists for this student and test
        const existingResult = await StudentResult.findOne({
            where: {
                student_id,
                test_id
            },
            transaction
        });
        if (!existingResult) {
            throw new ErrorHandler('Student result not found', 404);
        }

        // Update the existing result
        await existingResult.update({ obtained_marks }, { transaction });

        // Create a notification object (if applicable, save it or send it)
        const notification = {
            title: `Mark updated Message!`,
            message: `Dear ${student.user.name}, your marks for the test held on ${test.date} in ${test.subjects.subject_name} have been updated to ${obtained_marks}. Keep up the good work!`,
            user_id: student.user.user_id,
            notification_type_id: 3
        };

        const pushNotifications = []
        if(student.user.usersFCMTokens.length){
            // console.log(student.user.usersFCMTokens);
            
            student.user.usersFCMTokens.forEach((token) => {
                pushNotifications.push(
                    sendPushNotification(
                        `Mark updated Message!`,
                        `Dear ${student.user.name}, your marks for the test held on ${test.date} in ${test.subjects.subject_name} have been updated to ${obtained_marks}. Keep up the good work!`,
                        token.FCM_Token
                    )
                );
            });
        }

        // await Promise.all(pushNotifications)

        // You can save the notification here if required:
        await Notification.create(notification, { transaction });

        // Optionally, update the test status
        await test.update({ status: 'completed' }, { transaction });

        // Commit the transaction
        await transaction.commit();

        // Send the response
        res.status(200).json({
            success: true,
            message: 'Student marks have been updated successfully'
        });
    } catch (error) {
        // Rollback the transaction on any error
        await transaction.rollback();

        // Pass the error to the error-handling middleware
        return next(error instanceof ErrorHandler ? error : new ErrorHandler(error.message, 500));
    }
});


// exports.updateStudentMarks = catchAsyncError(async (req, res, next) => {

//     const { student_id, test_id, obtained_marks } = req.body

//     // Check if required fields are present
//     if (!student_id || !test_id || obtained_marks === undefined) {
//         return next(new ErrorHandler('Please fill all the fields', 400));
//     }

//     // Find the student record
//     const student = await Student.findOne({
//         where: { student_id },
//         include: [{
//             model: User
//         }]
//     });
//     if (!student) {
//         return next(new ErrorHandler('Student not found', 404));
//     }

//     // Find the test record
//     const test = await Test.findOne({ where: { test_id } });
//     if (!test) {
//         return next(new ErrorHandler('Test not found', 404));
//     }

//     // Check if the student's standard and batch match the test's standard and batch
//     if (student.standard_id !== test.standard_id || student.batch_id !== test.batch_id) {
//         return next(new ErrorHandler('The test does not belong to the same standard and batch as the student', 400));
//     }

//     // Check if the marks entry already exists for this student and test
//     const existingResult = await StudentResult.findOne({
//         where: {
//             student_id,
//             test_id
//         }
//     });

//     if (!existingResult) {
//         // If marks already not exist
//         return next(new ErrorHandler('Student result not found', 404));
//     }

//     const transaction = await sequelize.transaction()
//     try {
//         await existingResult.update({ obtained_marks }, { transaction });
//         const notification = {
//             title: `Mark updated Message!`,
//             message: `Dear ${student.user.name}, your marks for the test held on ${test.date} in ${test.subjects.subject_name} have been updated to ${obtained_marks}. Keep up the good work!`,
//             user_id: student.user.user_id,
//             notification_type_id: 3
//         }

//         // Optionally, mark the test as completed if all results are submitted
//         await test.update({
//             status: 'completed'
//         });


//         res.status(200).json({
//             success: true,
//             message: "Student marks have been updated successfully"
//         });
//     } catch (error) {
//         await transaction.rollback()
//         return next(new ErrorHandler(error.message, 500));
//     }
// });



