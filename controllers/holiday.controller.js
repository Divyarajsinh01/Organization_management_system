const catchAsyncError = require("../middlewares/catchAsyncError");
const { Holiday } = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const { validateDate } = require("../utils/validation");
const moment = require('moment')

exports.createHoliday = catchAsyncError(async (req, res, next) => {
    const { holiday_name, start_date, end_date } = req.body;

    validateDate(start_date)
    validateDate(end_date)
    const startDate = moment(start_date, 'DD/MM/YYYY').format('YYYY-MM-DD')
    const endDate = moment(end_date, 'DD/MM/YYYY').format('YYYY-MM-DD')
    if (!holiday_name || !start_date || !end_date) {
        return next(new ErrorHandler('Please fill in all fields', 400))
    }

    // Check for duplicate holiday by name and dates
    const existingHoliday = await Holiday.findOne({
        where: {
            holiday_name,
            start_date: startDate,
            end_date: endDate
        }
    });
    if (existingHoliday) {
        return next(new ErrorHandler('A holiday with the same name and dates already exists', 400));
    }


    const holiday = await Holiday.create({
        holiday_name,
        start_date: startDate,
        end_date: endDate
    })

    res.status(200).json({
        success: true,
        message: 'holiday created successfully!',
        data: holiday
    })
})

exports.getHolidays = catchAsyncError(async (req, res, next) => {
    const holidays = await Holiday.findAll({})

    if(holidays.length <= 0){
        return next(new ErrorHandler('No holidays found', 404))
    }

    res.status(200).json({
        success: true,
        message: 'holidays retrieved successfully!',
        data: holidays
    })
})

// Update holiday
exports.updateHoliday = catchAsyncError(async (req, res, next) => {
    const { holiday_id, holiday_name, start_date, end_date } = req.body;

    if (!holiday_name || !start_date || !end_date) {
        return next(new ErrorHandler('Please fill in all fields', 400));
    }

    const startDate = moment(start_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const endDate = moment(end_date, 'DD/MM/YYYY').format('YYYY-MM-DD');

    // Check if holiday exists
    const holiday = await Holiday.findOne({ where: { holiday_id } });
    if (!holiday) {
        return next(new ErrorHandler('Holiday not found', 404));
    }

    // Check for duplicate holiday by name and dates
    const existingHoliday = await Holiday.findOne({
        where: {
            holiday_name,
            start_date: startDate,
            end_date: endDate
        }
    });

    if (existingHoliday && existingHoliday.holiday_id !== holiday_id) {
        return next(new ErrorHandler('A holiday with the same name and dates already exists', 400));
    }

    // Update holiday
    holiday.holiday_name = holiday_name;
    holiday.start_date = startDate;
    holiday.end_date = endDate;

    await holiday.save();

    res.status(200).json({
        success: true,
        message: 'Holiday updated successfully!',
        data: holiday
    });
});

// Delete holiday (soft delete)
exports.deleteHoliday = catchAsyncError(async (req, res, next) => {
    const { holiday_id } = req.body; // holiday_id to delete

    // Find the holiday by id
    const holiday = await Holiday.findOne({ where: { holiday_id } });
    if (!holiday) {
        return next(new ErrorHandler('Holiday not found', 404));
    }

    // Soft delete (mark as deleted without actually removing from DB)
    await holiday.destroy(); // If you're using `paranoid: true`, this will soft delete

    res.status(200).json({
        success: true,
        message: 'Holiday deleted successfully!'
    });
});