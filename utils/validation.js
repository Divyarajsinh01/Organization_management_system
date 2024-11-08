const validator = require('validator');
const moment = require('moment');
const ErrorHandler = require('./errorHandler');  // Import your custom ErrorHandler

// Validate mobile number
exports.validateMobileNumber = (mobileNumber) => {
    if (!validator.isMobilePhone(mobileNumber, 'en-IN')) {
        throw new ErrorHandler('Invalid mobile number', 400);
    }
    return mobileNumber
};

// Validate email
exports.validEmail = (email) => {
    if (!validator.isEmail(email)) {
        throw new ErrorHandler('Invalid email address', 400);  // Use custom error handler
    }
    return email;
};

// Validate password
exports.validPassword = (password) => {
    if (!validator.isStrongPassword(password)) {
        throw new ErrorHandler('Please enter a strong password (min 8 characters, with numbers and symbols)', 400);  // Custom error for weak password
    }
    return password;
};


exports.validateTimeFormat = (timeRange) => {
    const [startTime, endTime] = timeRange.split(' - ');

    // Using 'h:mm A' format for times like "9:30 AM" and "6:00 PM"
    const isValidStartTime = moment(startTime.trim(), 'h:mm A', true).isValid();
    const isValidEndTime = moment(endTime.trim(), 'h:mm A', true).isValid();

    if (!isValidStartTime || !isValidEndTime) {
        throw new Error('Time must be in the format "h:mm AM/PM - h:mm AM/PM"');
    }
};

exports.validateTime = (time) => {
    const isValidTime = moment(time.trim(), 'hh:mm A', true).isValid();
    if (!isValidTime) {
        throw new Error('Time must be in the format "h:mm AM/PM"');
    }
}

// Validate Date and Time
exports.validateDate = (date) => {
    let isValid = true;
    let message = '';

    // // If both date and time are provided
    // if (date && time) {
    //     isValid = moment(`${date} ${time}`, 'DD/MM/YYYY hh:mm a', true).isValid();
    //     message = 'Invalid date and time format. Please use DD/MM/YYYY hh:mm a format.';
    // }

    // If only date is provided
    if (date) {
        isValid = moment(date, 'DD/MM/YYYY', true).isValid();
        message = 'Invalid date format. Please use DD/MM/YYYY format.';
    }

    // // // If only time is provided
    // else if (time) {
    //     isValid = moment(time, 'hh:mm a', true).isValid();
    //     message = 'Invalid time format. Please use hh:mm a format.';
    // }

    if (!isValid) {
        throw new Error(message);
    }
};


exports.validateISCurrentDateAndTime = (scheduleDate, scheduleTime) => {
    // Get current date and time
    const currentDateTime = moment(); // Current date and time

    // Combine the provided schedule date and time into a single moment object
    const scheduleDateTime = moment(`${scheduleDate} ${scheduleTime}`, 'DD/MM/YYYY hh:mm a');

    // Check if the provided schedule date-time is in the past
    if (scheduleDateTime.isBefore(currentDateTime)) {
        throw new Error('Scheduled date and time cannot be in the past.');
    }
}

exports.validateDuration = (duration) => {
    const durationValue = parseInt(duration, 10)
    // Check if the duration is a valid positive integer
    if (isNaN(durationValue) || durationValue <= 0) {
        throw new Error("Invalid duration: Please provide a positive integer value for duration in minutes.");
    }

    return durationValue;
}