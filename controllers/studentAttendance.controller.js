const { Op, where } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { Holiday, StudentAttendance, Student, Standard, Batch, User, sequelize, Notification } = require("../models");
const moment = require('moment');
const ErrorHandler = require("../utils/errorHandler");
const { validateDate } = require("../utils/validation");
const calculateHolidayDays = require("../utils/calculateHolidayDays");
const calculateStudyDays = require("../utils/studyDaysCount");

exports.createStudentAttendance = catchAsyncError(async (req, res, next) => {
    const { attendanceRecords, isNotify } = req.body; // Expecting an array of attendance records

    if (!attendanceRecords || attendanceRecords.length === 0) {
        return next(new ErrorHandler('Please provide attendance records', 400));
    }

    const transaction = await sequelize.transaction()

    try {
        const userMessages = [];
        // Loop through each attendance record
        for (let record of attendanceRecords) {
            const { student_id, date, isAbsent } = record;

            if (!student_id || !date || isAbsent === undefined) {
                return next(new ErrorHandler('Please provide all required fields for each attendance record', 400));
            }
            validateDate(date)

            // Convert the date to the same format as stored in the holiday model
            const attendanceDate = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

            // Check if the attendance date falls within any holiday range
            const holiday = await Holiday.findOne({
                where: {
                    start_date: { [Op.lte]: attendanceDate },
                    end_date: { [Op.gte]: attendanceDate }
                }
            }, { transaction });

            if (holiday) {
                await transaction.rollback()
                return next(new ErrorHandler('Attendance cannot be marked on a holiday', 400));
            }

            // Find the student record
            const student = await Student.findOne({
                where: { student_id },
                include: [{
                    model: User
                }]
            }, { transaction });

            if (!student) {
                await transaction.rollback();
                return next(new ErrorHandler('Student not found', 404));
            }

            // Check if attendance for the same student and date already exists
            const existingAttendance = await StudentAttendance.findOne({
                where: {
                    student_id,
                    date: attendanceDate
                }
            }, { transaction });

            if (existingAttendance) {
                await transaction.rollback();
                return next(new ErrorHandler('Attendance for this student has already been marked for this date', 400));
            }

            // If no holiday is found, proceed with creating attendance
            const createdAttendance = await StudentAttendance.create({
                student_id,
                date: attendanceDate,
                isAbsent
            }, { transaction });

            // **Prepare notification data if isNotify is true**
            if (isNotify && isAbsent) {
                userMessages.push({
                    title: `Attendance Message!`,
                    message: `Dear ${student.user.name}, you are absent on ${date}!`,
                    user_id: student.user.user_id,
                    notification_type_id: 3
                });

                // Update the attendance record to mark notification as sent
                await createdAttendance.update({ isNotificationSent: true }, { transaction });
            }
        }

        // **Save notifications to the database if isNotify is true**
        if (isNotify && userMessages.length > 0) {
            await Notification.bulkCreate(userMessages, { transaction });
        }

        await transaction.commit()

        res.status(200).json({
            success: true,
            message: isNotify ? "Attendance records created successfully and notification sent!" : 'Attendance records created successfully!',
        });
    } catch (error) {
        await transaction.rollback()
        return next(new ErrorHandler(error.message, 400))
    }
});

exports.getAttendanceList = catchAsyncError(async (req, res, next) => {
    const { name, student_id, standard_id, batch_id, isAbsent, date, startDate, endDate } = req.body
    

    const attendanceWhere = {}
    const studentWhere = {}
    const userWhere = {}

    if (name) {
        userWhere.name = { [Op.like]: `%${name}%` }
    }

    if (student_id) {
        studentWhere.student_id = student_id
    }

    if (standard_id) {
        studentWhere.standard_id = standard_id
    }

    if (batch_id) {
        studentWhere.batch_id = batch_id
    }

    // Ensure isAbsent is boolean and correctly set
    if (typeof isAbsent !== 'undefined') {
        attendanceWhere.isAbsent = isAbsent;
    }

    if (date) {
        validateDate(date)
        const attendanceDate = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
        attendanceWhere.date = attendanceDate
    }

    let formattedStartDate
    let formattedEndDate

    // Validate and format start and end dates
    if (startDate && endDate) {
        validateDate(startDate);
        validateDate(endDate);

        formattedStartDate = moment(startDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        formattedEndDate = moment(endDate, 'DD/MM/YYYY').format('YYYY-MM-DD');

        attendanceWhere.date = {
            [Op.between]: [formattedStartDate, formattedEndDate],
        };
    }

    // Fetch holidays overlapping the range
    const holidays = await Holiday.findAll({
        where: {
            [Op.or]: [
                { start_date: { [Op.between]: [formattedStartDate, formattedEndDate] } },
                { end_date: { [Op.between]: [formattedStartDate, formattedEndDate] } },
            ],
        },
    });

    // Calculate total holiday days
    const totalHolidayDays = calculateHolidayDays(holidays, formattedStartDate, formattedEndDate);

    // Calculate total study days
    const totalStudyDays = calculateStudyDays(formattedStartDate, formattedEndDate, totalHolidayDays);
    const attendanceList = await Student.findAll({
        where: studentWhere,
        include: [
            {
                model: User,
                where: userWhere,
                attributes: { exclude: ['password'] }
            },
            {
                model: Standard,
            },
            {
                model: Batch,
            },
            {
                model: StudentAttendance,
                required: true,
                where: attendanceWhere,
            }
        ],
        order: [[StudentAttendance, 'date', 'DESC']] // Order applied at the root level
    })

    const data = attendanceList.map((student) => {
        const attendanceRecords = student.student_attendances;

        // Count present and absent days
        const totalPresent = attendanceRecords.filter((rec) => !rec.isAbsent).length;
        const totalAbsent = attendanceRecords.filter((rec) => rec.isAbsent).length;

        return {
            student_id: student.student_id,
            user_id: student.user_id,
            name: student.user.name,
            standard_id: student.standard_id,
            standard: student.standard.standard,
            batch_id: student.batch_id,
            batch_name: student.batch.batch_name,
            batch_time: student.batch.batch_time,
            student_attendances: attendanceRecords,
            totalPresent,
            totalAbsent,
            totalHolidays: totalHolidayDays,
            totalStudyDays: totalStudyDays,
        };
    });

    if (attendanceList <= 0) {
        return next(new ErrorHandler('No attendance found', 404))
    }

    res.status(200).json({
        success: true,
        message: 'Student attendance list fetched successfully!',
        data
    })
})

exports.getLoginStudentAttendance = catchAsyncError(async (req, res, next) => {
    const { name, student_id, standard_id, batch_id, isAbsent, startDate, endDate } = req.body
    const user_id = req.user.user_id
    // validateDate(date)
    // const attendanceDate = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')

    const attendanceWhere = {}
    const studentWhere = {}
    const userWhere = { user_id }

    if (name) {
        userWhere.name = { [Op.like]: `%${name}%` }
    }

    if (student_id) {
        studentWhere.student_id = student_id
    }

    if (standard_id) {
        studentWhere.standard_id = standard_id
    }

    if (batch_id) {
        studentWhere.batch_id = batch_id
    }

    // Ensure isAbsent is boolean and correctly set
    if (typeof isAbsent !== 'undefined') {
        attendanceWhere.isAbsent = isAbsent;
    }

    // if (date) {
    //     attendanceWhere.date = attendanceDate
    // }

    let formattedStartDate
    let formattedEndDate

    // Validate and format start and end dates
    if (startDate && endDate) {
        validateDate(startDate);
        validateDate(endDate);

        formattedStartDate = moment(startDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        formattedEndDate = moment(endDate, 'DD/MM/YYYY').format('YYYY-MM-DD');

        attendanceWhere.date = {
            [Op.between]: [formattedStartDate, formattedEndDate],
        };
    }

    // Fetch holidays overlapping the range
    const holidays = await Holiday.findAll({
        where: {
            [Op.or]: [
                { start_date: { [Op.between]: [formattedStartDate, formattedEndDate] } },
                { end_date: { [Op.between]: [formattedStartDate, formattedEndDate] } },
            ],
        },
    });

    // Calculate total holiday days
    const totalHolidayDays = calculateHolidayDays(holidays, formattedStartDate, formattedEndDate);

    // Calculate total study days
    const totalStudyDays = calculateStudyDays(formattedStartDate, formattedEndDate, totalHolidayDays);

    const attendanceList = await Student.findAll({
        where: studentWhere,
        include: [
            {
                model: User,
                where: userWhere
            },
            {
                model: Standard,
            },
            {
                model: Batch,
            },
            {
                model: StudentAttendance,
                required: true,
                where: attendanceWhere,
            }
        ],
        order: [[StudentAttendance, 'date', 'DESC']] // Order applied at the root level
    })

    if (attendanceList <= 0) {
        return next(new ErrorHandler('No attendance found', 404))
    }

    const data = attendanceList.map((student) => {
        const attendanceRecords = student.student_attendances;

        // Count present and absent days
        const totalPresent = attendanceRecords.filter((rec) => !rec.isAbsent).length;
        const totalAbsent = attendanceRecords.filter((rec) => rec.isAbsent).length;

        return {
            student_id: student.student_id,
            user_id: student.user_id,
            name: student.user.name,
            standard_id: student.standard_id,
            standard: student.standard.standard,
            batch_id: student.batch_id,
            batch_name: student.batch.batch_name,
            batch_time: student.batch.batch_time,
            student_attendances: attendanceRecords,
            totalPresent,
            totalAbsent,
            totalHolidays: totalHolidayDays,
            totalStudyDays: totalStudyDays,
        };
    });

    res.status(200).json({
        success: true,
        message: 'Student attendance list fetched successfully!',
        data
    })
})

exports.updateAttendance = catchAsyncError(async (req, res, next) => {
    const { attendance_id, isAbsent } = req.body

    if (!attendance_id) {
        return next(new ErrorHandler('Attendance ID is required', 400))
    }

    const attendance = await StudentAttendance.findByPk(attendance_id)
    if (!attendance) {
        return next(new ErrorHandler('Attendance not found', 404))
    }

    if (isAbsent !== 'undefined') {
        attendance.isAbsent = isAbsent
    }

    await attendance.save()

    res.status(200).json({
        success: true,
        message: 'Attendance updated successfully!',
    })
})
