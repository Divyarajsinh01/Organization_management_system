const ErrorHandler = require("../utils/errorHandler");

exports.CreateSimpleMessage = catchAsyncError(async (req, res, next) => {
    const { user_ids, title, message } = req.body;

    // Validate data
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return next(new ErrorHandler("User IDs are required.", 400));
    }

    if (!title || !message) {
        return next(new ErrorHandler ("Title and message are required.", 400));
    }

    // Loop through the user IDs and send the message to each user
    for (let userId of user_ids) {
        // Send the message logic to each user (you can create notifications or send SMS, etc.)
        // Example: db.Notification.create({ user_id: userId, title, message })
    }

    res.status(200).json({ message: "Messages sent successfully." });
});
