const moment = require("moment");
const catchAsyncError = require("../middlewares/catchAsyncError");
const db = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const { validateISCurrentDateAndTime, validateDuration, validateTime, validateDate } = require("../utils/validation");
const { Op } = require("sequelize");
const { Standard, Test } = db

exports.scheduleTest = catchAsyncError(async (req, res, next) => {
    const { standard_id, subject_id, batch_id, topic, scheduleDate, startTime, endTime, description, marks } = req.body;

    if (!standard_id || !subject_id || !batch_id || !topic || !scheduleDate || !startTime || !description || !endTime || !marks) {
        return next(new ErrorHandler('Please fill all the fields!', 400))
    }

    validateTime(startTime)
    validateTime(endTime)
    validateISCurrentDateAndTime(scheduleDate, startTime)
    // const durationInMinutes = validateDuration(duration);

    if (isNaN(marks) || marks < 0) {
        return next(new ErrorHandler('Invalid marks! Please enter a valid number.', 400))
    }

    const isStandard = await Standard.findOne({ where: { standard_id } })
    if (!isStandard) {
        return next(new ErrorHandler('Standard is not available', 400))
    }

    const StandardsSubjects = await isStandard.getSubjects({
        where: { subject_id },
    })

    if (StandardsSubjects.length <= 0) {
        return next(new ErrorHandler('Subject is not available for this standard', 400))
    }

    const isBatch = await isStandard.getBatches({
        where: { batch_id }
    })

    if (isBatch.length <= 0) {
        return next(new ErrorHandler('Batch is not available for this standard', 400))
    }

    const startDate = moment(`${scheduleDate}`, "DD/MM/YYYY").format('YYYY-MM-DD');
    const startTimeOnly = moment(startTime, "hh:mm A").format("HH:mm:ss");    // "14:30:00" (string)
    const endTimeOnly = moment(endTime, "hh:mm A").format("HH:mm:ss");
    // const endTimeOnly = moment(startTime, "hh:mm A").add(durationInMinutes, "minutes").format("HH:mm:ss"); // "15:30:00" (string)

    // console.log(startDateTime)
    // console.log(endDateTime)
    // Check if a test is already scheduled during the specified time
    const isTestAlreadyScheduled = await Test.findOne({
        where: {
            standard_id,
            // subject_id,
            batch_id,
            date: startDate,
            [Op.or]: [
                // Case 1: New test starts during an existing test
                {
                    startTime: { [Op.lte]: startTimeOnly },
                    endTime: { [Op.gt]: startTimeOnly }
                },
                // Case 2: New test ends during an existing test
                {
                    startTime: { [Op.lt]: endTimeOnly },
                    endTime: { [Op.gte]: endTimeOnly }
                },
                // Case 3: Existing test fully within new test
                {
                    startTime: { [Op.gte]: startTimeOnly },
                    endTime: { [Op.lte]: endTimeOnly }
                },
                // Case 4: New test fully contains an existing test
                {
                    startTime: { [Op.lte]: startTimeOnly },
                    endTime: { [Op.gte]: endTimeOnly }
                }
            ]
        }
    });

    // console.log(isTestAlreadyScheduled.toJSON().date)

    if (isTestAlreadyScheduled) {
        return next(new ErrorHandler('Test is already scheduled for this time!', 400))
    }
    // console.log('endTime', endTimeOnly)
    const scheduleTests = await Test.create({
        standard_id,
        subject_id,
        batch_id,
        topic,
        date: startDate,
        startTime: startTimeOnly,
        endTime: endTimeOnly,
        description,
        marks
    })

    res.status(200).json({
        status: 'success',
        message: 'test scheduled successfully',
        date: scheduleTests
    })
})

exports.getListOfScheduleTest = catchAsyncError(async (req, res, next) => {

    const { limit, page, standard_id, batch_id, subject_id, date } = req.body;

    let options = {};

    // If 'limit' and 'page' are passed, apply pagination
    // if (limit && page) {
    //     const offset = (page - 1) * limit;

    //     options.limit = Number(limit);
    //     options.offset = offset;
    // }

    // Add conditions to the where clause
    if (standard_id) {
        options.standard_id = standard_id;
    }

    if (batch_id) {
        options.batch_id = batch_id;
    }

    if (subject_id) {
        options.subject_id = subject_id;
    }

    if (date) {
        options.date = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    // Get the current time in UTC
    const currentTime = moment().format('HH:mm:ss');
    // const currentDate = moment().format('YYYY-MM-DD');

    // Fetch all tests, filtering by 'pending', 'completed', and 'marks_not_assign' statuses
    const scheduleTests = await Test.findAll({
        where: {
            ...options,
            [Op.or]: [
                // Pending tests: scheduled for a future date
                {
                    startTime: {
                        [Op.gt]: currentTime // Only upcoming tests with future date
                    },
                    status: 'pending' // Add status filter for pending
                },
                // Completed tests: tests with 'completed' status
                {
                    status: 'completed'
                },
                // Tests with marks not assigned yet
                {
                    status: 'marks_not_assign'
                },
                // Tests that are in the past but haven't been marked as completed
                {
                    startTime: {
                        [Op.lt]: currentTime // Test date is in the past
                    },
                    status: {
                        [Op.ne]: 'completed' // Only fetch tests not marked as 'completed'
                    }
                }
            ]
        },
        attributes: { exclude: ['standard_id', 'subject_id', 'batch_id'] },
        include: [
            {
                model: Standard,
                as: 'standard',
            },
            {
                model: db.Subject,
                as: 'subjects'
            },
            {
                model: db.Batch,
                as: 'batches'
            }
        ],
        order: [['date', 'ASC']]  // Sort by ascending date
    });

    if (scheduleTests.length <= 0) {
        return next(new ErrorHandler('No  schedule test found', 404))
    }

    // Convert startTime and endTime for each test to hh:mm A format
    // const formatTestTimes = (tests) => {
    //     return tests.map(test => {
    //         return {
    //             ...test.dataValues, // Spread to access other fields
    //             startTime: moment(test.startTime, 'HH:mm:ss').format('hh:mm A'),
    //             endTime: test.endTime ? moment(test.endTime, 'HH:mm:ss').format('hh:mm A') : null
    //         };
    //     });
    // };

    // // Separate tests into categories
    // const pendingTests = scheduleTests.filter(test => 
    //     (test.status === 'pending') && 
    //     (test.date > currentDate || (test.date === currentDate && test.startTime > currentTime))
    // );

    // const completedTests = scheduleTests.filter(test => test.status === 'completed' && test.isNotificationSent);

    // const marksNotAssignedTests = scheduleTests.filter(test => test.status === 'marks_not_assign');

    // const marksAssignedButMessageNotSent = scheduleTests.filter(test => test.status === 'completed' && !test.isNotificationSent);

    // const pastTestsNotCompleted = scheduleTests.filter(
    //     test =>
    //         test.status !== 'completed' &&
    //         test.status !== 'marks_not_assign' &&  // Exclude tests with "marks_not_assign" status
    //         (test.date < currentDate || (test.date === currentDate && test.startTime < currentTime))
    // );

    //categories data
    // Use reduce to categorize tests dynamically
    const categories = scheduleTests.reduce((acc, test) => {
        const currentTime = moment().format('HH:mm:ss');
        const currentDate = moment().format('YYYY-MM-DD');

        if (test.status === 'pending' && (test.date > currentDate || (test.date === currentDate && test.startTime > currentTime))) {
            acc.pending.push(test);
        } else if (test.status === 'marks_not_assign') {
            acc.markNotAssign.marksNotAssigned.push(test);
        } else if (test.status === 'completed') {
            if (test.isNotificationSent) acc.completed.push(test);
            else acc.markNotAssign.marksMessageNotSent.push(test);
        } else if (test.date < currentDate || (test.date === currentDate && test.startTime < currentTime)) {
            acc.pastNotCompleted.push(test);
        }

        return acc;
    }, {
        pending: [],
        markNotAssign: { marksNotAssigned: [], marksMessageNotSent: [] },
        completed: [],
        pastNotCompleted: []
    });

    // Send the categorized tests in the response
    res.status(200).json({
        success: true,
        message: 'Tests data fetched successfully!',
        // scheduleTests
        data: Object.entries(categories).map(([status, data]) => ({
            status,
            data: Array.isArray(data) ? data : Object.entries(data).map(([subStatus, subData]) => ({
                status: subStatus,
                data: subData
            }))
        })),
    });
});

exports.updateTestsStatus = catchAsyncError(async (req, res, next) => {
    const { test_id, startDate, startTime, endTime, status, description, topic } = req.body;

    if (!test_id) {
        return next(new ErrorHandler('Please provide test id for update record!', 400));
    }

    const isTest = await Test.findOne({ where: { test_id } });

    if (!isTest) {
        return next(new ErrorHandler('Test Data not found!', 400));
    }

    // console.log(moment(isTest.endTime).format('DD/MM/YYYY hh:mm a'))

    const currentTime = moment().format('HH:mm:ss');
    const currentDate = moment().format('YYYY-MM-DD')

    // Check if the current time is greater than the test's end time
    if (status) {
        if (isTest.date < currentDate || (isTest.date === currentDate && (currentTime > isTest.endTime))) {

            isTest.status = status;  // Update the status only if the test has ended
        } else {
            return next(new ErrorHandler('Test has not ended yet!', 400));
        }
    }

    // If the duration is provided in the request, use it, otherwise, use the existing duration from the found test
    // const updatedDuration = duration ? validateDuration(duration) : isTest.duration;


    // If startDate and startTime are provided, validate and update the test's start and end time
    if (startDate && startTime) {
        validateDate(startDate.trim());
        validateTime(startTime)
        validateTime(endTime)
        // validateISCurrentDateAndTime(startDate, startTime);

        const startDateOnly = moment(`${startDate}`, 'DD/MM/YYYY').format('YYYY-MM-DD')
        const startTimeOnly = moment(`${startTime}`, "hh:mm A").format('HH:mm:ss');
        const endTimeOnly = moment(endTime, "hh:mm A").format('HH:mm:ss');
        

        // Check if any other test is already scheduled during the updated time
        const isTestConflict = await Test.findOne({
            where: {
                test_id: { [Op.ne]: test_id }, // Exclude the current test
                date: startDateOnly,
                standard_id: isTest.standard_id,
                batch_id: isTest.batch_id,
                [Op.or]: [
                    // Case 1: New test starts during an existing test
                    {
                        startTime: {
                            [Op.lte]: startTimeOnly // Existing test starts before or exactly when the new test starts
                        },
                        endTime: {
                            [Op.gt]: startTimeOnly // Existing test ends after the new test starts
                        }
                    },
                    // Case 2: New test ends during an existing test
                    {
                        startTime: {
                            [Op.lt]: endTimeOnly // Existing test starts before the new test ends
                        },
                        endTime: {
                            [Op.gte]: endTimeOnly // Existing test ends after or exactly when the new test ends
                        }
                    },
                    // Case 3: Existing test is fully within the new test
                    {
                        startTime: { [Op.gte]: startTimeOnly },
                        endTime: { [Op.lte]: endTimeOnly }
                    },
                    // Case 4: New test fully encompasses an existing test
                    {
                        startTime: { [Op.lte]: startTimeOnly },
                        endTime: { [Op.gte]: endTimeOnly }
                    }
                ]
            }
        });

        // If there's a conflict with another test, return an error
        if (isTestConflict) {
            return next(new ErrorHandler('Another test is already scheduled during this time!', 400));
        }

        isTest.date = startDateOnly;   // Update the test's start time
        isTest.startTime = startTimeOnly
        isTest.endTime = endTimeOnly;  // Update the test's end time
    }

    if(description){
        isTest.description = description;
    }

    if(topic){
        isTest.topic = topic;
    }

    // // If duration is updated, ensure the test's end time reflects this change
    // if (duration) {
    //     const newEndTime = moment(isTest.startTime, "HH:mm:ss").add(updatedDuration, "minutes").format('HH:mm:ss');
    //     isTest.endTime = newEndTime;
    //     isTest.duration = updatedDuration;  // Update duration if provided
    // }

    await isTest.save();

    res.status(200).json({
        success: true,
        message: 'Test updated successfully!',
        data: isTest
    });
});

exports.deleteScheduleTests = catchAsyncError(async (req, res, next) => {
    const { test_id } = req.body

    if (!test_id) {
        return next(new ErrorHandler('Please provide test id for update record!', 400));
    }

    const isTest = await Test.findOne({ where: { test_id } })

    if (!isTest) {
        return next(new ErrorHandler('Test Data not found!', 400));
    }

    // const currentTime = moment().format('HH:mm:ss')
    // const currentDate = moment().format('YYYY-MM-DD')
    // if (isTest.date < currentDate || (isTest.date === currentDate && isTest.endTime < currentTime)) {
    //     return next(new ErrorHandler('sorry you can  not delete this test because it has been already taken!', 400));
    // }

    if (isTest.status !== 'pending') {
        return next(new ErrorHandler('Sorry, you cannot delete this test because it has already been taken or is not pending.', 400));
    }

    await isTest.destroy()

    res.status(200).json({
        success: true,
        message: 'Test deleted successfully!'
    })
})

