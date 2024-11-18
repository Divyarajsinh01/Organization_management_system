const { Op, where } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { Holiday, StudentAttendance, Student, Standard, Batch, User } = require("../models");
const moment = require('moment');
const ErrorHandler = require("../utils/errorHandler");
const { validateDate } = require("../utils/validation");

exports.createStudentAttendance = catchAsyncError(async (req, res, next) => {
    const { attendanceRecords } = req.body; // Expecting an array of attendance records

    if (!attendanceRecords || attendanceRecords.length === 0) {
        return next(new ErrorHandler('Please provide attendance records', 400));
    }

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
        });

        if (holiday) {
            return next(new ErrorHandler('Attendance cannot be marked on a holiday', 400));
        }

        // If no holiday is found, proceed with creating attendance
        await StudentAttendance.create({
            student_id,
            date: attendanceDate,
            isAbsent
        });
    }

    res.status(200).json({
        success: true,
        message: 'Attendance records created successfully!',
    });
});

exports.getAttendanceList = catchAsyncError(async (req, res, next) => {
    const { name, student_id, standard_id, batch_id, isAbsent, date } = req.body
    validateDate(date)
    const attendanceDate = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')

    const attendanceWhere = {}
    const studentWhere = {}
    const userWhere = {}

    if(name){
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

    if(date){
        attendanceWhere.date = attendanceDate
    }


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

    if(attendanceList <= 0){
        return next(new ErrorHandler('No attendance found', 404))
    }

    res.status(200).json({
        success: true,
        message: 'Student attendance list fetched successfully!',
        data: attendanceList
    })
})

exports.getLoginStudentAttendance = catchAsyncError(async (req, res, next) => {
    const { name, student_id, standard_id, batch_id, isAbsent, date } = req.body
    const user_id = req.user.user_id
    validateDate(date)
    const attendanceDate = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')

    const attendanceWhere = {}
    const studentWhere = {}
    const userWhere = {user_id}

    if(name){
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

    if(date){
        attendanceWhere.date = attendanceDate
    }


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

    if(attendanceList <= 0){
        return next(new ErrorHandler('No attendance found', 404))
    }

    res.status(200).json({
        success: true,
        message: 'Student attendance list fetched successfully!',
        data: attendanceList
    })
})

exports.updateAttendance = catchAsyncError(async (req, res, next) => {
    const { attendance_id, isAbsent } = req.body

    if(!attendance_id){
        return next(new ErrorHandler('Attendance ID is required', 400))
    }

    const attendance = await StudentAttendance.findByPk(attendance_id)
    if(!attendance){
        return next(new ErrorHandler('Attendance not found', 404))
    }

    if(isAbsent !== 'undefined'){
        attendance.isAbsent = isAbsent
    }

    await attendance.save()

    res.status(200).json({
        success: true,
        message: 'Attendance updated successfully!',
    })
})
