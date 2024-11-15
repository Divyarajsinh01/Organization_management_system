const catchAsyncError = require("../middlewares/catchAsyncError");
const { Student, StudentResult, Test, Sequelize, User, Subject, Standard, Batch } = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const { validateDate } = require("../utils/validation");
const { Op } = Sequelize;
const moment = require('moment')

// Function to calculate average marks for each student
const calculateAverageMarks = (students) => {
    // If the input is a single student object, wrap it in an array
    const studentsArray = Array.isArray(students) ? students : [students];

    return studentsArray.map((student) => {
        const totalMarks = student.studentResults.reduce((sum, result) => sum + result.obtained_marks, 0);
        const averageMarks = totalMarks / student.studentResults.length;
        return {
            ...student.toJSON(),
            totalMarks,
            average_marks: averageMarks,
        };
    });
};

exports.addStudentMarks = catchAsyncError(async (req, res, next) => {
    const { studentMarks } = req.body;

    for (const { student_id, test_id, obtained_marks } of studentMarks) {
        // Check if required fields are present
        if (!student_id || !test_id || obtained_marks === undefined) {
            return next(new ErrorHandler('Please fill all the fields', 400));
        }

        // Find the student record
        const student = await Student.findOne({
            where: { student_id },
            include: [{
                model: User
            }]
        });
        if (!student) {
            return next(new ErrorHandler('Student not found', 404));
        }

        // Find the test record
        const test = await Test.findOne({ where: { test_id } });
        if (!test) {
            return next(new ErrorHandler('Test not found', 404));
        }

        // Check if the student's standard and batch match the test's standard and batch
        if (student.standard_id !== test.standard_id || student.batch_id !== test.batch_id) {
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
            // If marks are already assigned, skip creating/updating the record
            return next(new ErrorHandler(`Marks for student_id ${student_id} and test_id ${test_id} are already assigned`, 400));
        }

        // Create or update the StudentResult record with obtained marks
        await StudentResult.upsert({
            student_id,
            test_id,
            obtained_marks
        });

        await test.update({
            status: 'completed'
        })
    }

    res.status(200).json({
        success: true,
        message: "Student marks have been added successfully"
    });
});

exports.getStudentMarks = catchAsyncError(async (req, res, next) => {
    const { student_id, standard_id, batch_id, subject_id, from_date, to_date } = req.body;

    validateDate(from_date);
    validateDate(to_date)

    const startDate = moment(from_date, 'DD/MM/YYYY').format('YYYY-MM-DD')
    const endDate = moment(to_date, 'DD/MM/YYYY').format('YYYY-MM-DD')

    // Initialize filter options for students and tests
    const whereConditions = {};
    const testConditions = {};

    // Apply filters if provided
    if (student_id) whereConditions.student_id = student_id;
    if (standard_id) whereConditions.standard_id = standard_id;
    if (batch_id) whereConditions.batch_id = batch_id;

    if (subject_id) testConditions.subject_id = subject_id;

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

    const studentResultData = calculateAverageMarks(studentsWithMarks)

    // Send the aggregated data (total and average marks)
    res.status(200).json({
        success: true,
        message: "Student marks fetched successfully!",
        data: studentResultData
    });
});

exports.getTop10Students = catchAsyncError(async (req, res, next) => {
    const { standard_id, batch_id, subject_id, from_date, to_date } = req.body;

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

    if (subject_id) testConditions.subject_id = subject_id;

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
    const top10Students = studentResultData.sort((a, b) => b.average_marks - a.average_marks).slice(0, 10);

    // Send the aggregated data (top 10 students with their average marks)
    res.status(200).json({
        success: true,
        message: "Top 10 students fetched successfully!",
        data: studentResultData
    });
});

exports.getStudentsProgressReport = catchAsyncError(async (req, res, next) => {
    const { user_id } = req.user; // Assume user_id is from JWT or session
    // console.log(user_id)
    const { standard_id, batch_id, subject_id, from_date, to_date } = req.body;

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
    if (subject_id) testConditions.subject_id = subject_id;

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
    // const studentsProgress = calculateAverageMarksForMultipleStudents(studentsWithProgress);

    // Send the progress data
    res.status(200).json({
        success: true,
        message: 'Students progress reports fetched successfully!',
        data: studentsWithProgress,
    });
});

exports.updateStudentMarks = catchAsyncError(async (req, res, next) => {

    const {student_id, test_id, obtained_marks} = req.body

    // Check if required fields are present
    if (!student_id || !test_id || obtained_marks === undefined) {
        return next(new ErrorHandler('Please fill all the fields', 400));
    }

    // Find the student record
    const student = await Student.findOne({
        where: { student_id },
        include: [{
            model: User
        }]
    });
    if (!student) {
        return next(new ErrorHandler('Student not found', 404));
    }

    // Find the test record
    const test = await Test.findOne({ where: { test_id } });
    if (!test) {
        return next(new ErrorHandler('Test not found', 404));
    }

    // Check if the student's standard and batch match the test's standard and batch
    if (student.standard_id !== test.standard_id || student.batch_id !== test.batch_id) {
        return next(new ErrorHandler('The test does not belong to the same standard and batch as the student', 400));
    }

    // Check if the marks entry already exists for this student and test
    const existingResult = await StudentResult.findOne({
        where: {
            student_id,
            test_id
        }
    });

    if (existingResult) {
        // If marks already exist, update them
        await existingResult.update({ obtained_marks });
    } else {
        return next(new ErrorHandler('Student result not found', 404));
    }

    // Optionally, mark the test as completed if all results are submitted
    await test.update({
        status: 'completed'
    });


    res.status(200).json({
        success: true,
        message: "Student marks have been updated successfully"
    });
});



