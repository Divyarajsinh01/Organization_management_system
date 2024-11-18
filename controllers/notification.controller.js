const catchAsyncError = require("../middlewares/catchAsyncError");
const { Standard, Batch, Student, User, NotificationType, Notification } = require("../models");
const ErrorHandler = require("../utils/errorHandler");

exports.addNotificationTypes = catchAsyncError(async (req, res, next) => {
    const { notification_type } = req.body;

    if (!notification_type) {
        return next(new ErrorHandler('Please provide notification type'), 400)
    }

    const isNotificationType = await NotificationType.findOne({ where: { notification_type } })

    if (isNotificationType) {
        return next(new ErrorHandler('Notification type already exists', 400))
    }

    await NotificationType.create({ notification_type })
    res.status(200).json({
        success: true,
        message: 'Notification type added successfully'
    })
})

exports.getAllNotificationTypes = catchAsyncError(async (req, res, next) => {
    const notificationTypes = await NotificationType.findAll({})

    if (notificationTypes.length <= 0) {
        return next(new ErrorHandler('No Notification Types found', 404))
    }

    res.status(200).json({
        success: true,
        message: 'notification type fetched successfully!',
        data: notificationTypes
    })
})

exports.CreateSimpleMessage = catchAsyncError(async (req, res, next) => {
    const { title, message, standardData } = req.body;

    // Validate data
    if (!standardData || !Array.isArray(standardData) || standardData.length === 0) {
        return next(new ErrorHandler("Standard data is required.", 400));
    }

    if (!title || !message) {
        return next(new ErrorHandler("Title and message are required.", 400));
    }

    const userMessages = [];

    // Process standards and batches in bulk
    for (let standard of standardData) {
        const { standard_id, batch_ids } = standard;

        const studentWhere = {}
        if (standard_id) {
            studentWhere.standard_id = standard_id
        }

        if (batch_ids) {
            studentWhere.batch_id = batch_ids
        }

        // Validate standard
        const isStandard = await Standard.findByPk(standard_id);
        if (!isStandard) {
            return next(new ErrorHandler(`Standard with ID ${standard_id} not found.`, 404));
        }

        // Validate batches for the standard
        const isStandardBatch = await Batch.findAll({
            where: {
                standard_id: standard_id,
                batch_id: batch_ids, // Use correct field name for batch IDs
            },
        });

        if (!isStandardBatch || isStandardBatch.length === 0) {
            return next(new ErrorHandler(`No batches found for standard ID ${standard_id}.`, 404));
        }

        // Fetch students for the standard and batches
        const students = await Student.findAll({
            where: studentWhere,
            include: [
                {
                    model: User, // Include associated user data
                    attributes: ["user_id"], // Fetch only required user fields
                },
            ],
        });

        if (!students || students.length === 0) {
            return next(new ErrorHandler(`No students found for standard ID ${standard_id} and batch IDs.`, 404));
        }

        // Prepare messages for users
        students.forEach((student) => {
            if (student.user) {
                userMessages.push({
                    title: title,
                    message: message,
                    user_id: student.user.user_id,
                    notification_type_id: 1
                });
            }
        });
    }

    const notification = await Notification.bulkCreate(userMessages)

    // Simulate message sending or save to DB
    // console.log("Prepared Messages: ", userMessages);

    res.status(200).json({
        success: true,
        message: "Messages sent successfully.",
        data: notification,
    });
});

exports.createMarksMessage = catchAsyncError(async (req, res, next) => {
    const { userData } = req.body;

    const userMessages = []
    for (const user of userData) {
        const { user_id, name, subject, date, mark } = user

        userMessages.push({
            title: `Marks Message!`,
            message: `Dear ${name}, you have scored ${mark} marks in ${subject} on ${date}. Keep up the good work!`,
            user_id: user_id,
            notification_type_id: 3
        })
    }

    await Notification.bulkCreate(userMessages)

    res.status(200).json({
        success: true,
        message: "marks message sent successfully.",
    })
})

exports.createAttendanceMessage = catchAsyncError(async (req, res, next) => {
    const { userData } = req.body;
    const userMessages = []
    for (const user of userData) {
        const { user_id, name, date } = user

        userMessages.push({
            title: `Attendance Message!`,
            message: `Dear student ${name}, you are absent on ${date}!`,
            user_id: user_id,
            notification_type_id: 2
        })
    }

    await Notification.bulkCreate(userMessages)

    res.status(200).json({
        success: true,
        message: "Attendance message sent successfully.",
    })
})

exports.getNotifications = catchAsyncError(async (req, res, next) => {
    const { notification_type_id, is_read } = req.body
    const user_id = req.user.user_id

    const notificationsWhere = { user_id }
    if (notification_type_id) notificationsWhere.notification_type_id = notification_type_id
    if (is_read !== undefined) notificationsWhere.is_read = is_read

    const notifications = await Notification.findAll({
        where: notificationsWhere,
        order: [['createdAt', 'ASC']]
    })

    if (notifications.length <= 0) {
        return next(new ErrorHandler('No notifications found', 404))
    }

    res.status(200).json({
        success: true,
        message: 'notification list',
        data: notifications
    })
})

exports.updateNotifications = catchAsyncError(async (req, res, next) => {
    const { notification_id, is_read } = req.body

    const isNotification = await Notification.findOne({
        where: { notification_id }
    })

    if (!isNotification) {
        return next(new ErrorHandler('Notification not found', 404))
    }

    await isNotification.update({
        is_read: is_read
    })

    res.status(200).json({
        success: true,
        message: 'Notification updated successfully',
    })
})