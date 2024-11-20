const ErrorHandler = require("../utils/errorHandler");
const removeSensitiveInfo = require("../utils/removeSensitiveInfo");
const catchAsyncError = require("./catchAsyncError");

exports.roleRestrict = (...allowedRoles) => {
    return catchAsyncError(async (req, res, next) => {
        const user = removeSensitiveInfo(req.user);

        // Check if the user's role matches any of the allowed roles
        if (allowedRoles.includes(user.role_id)) {
            return next(); // Allow the user to proceed
        } 
        
        // Return an error with the allowed roles included in the message
        // const allowedRolesList = allowedRoles.join("/");
        return next(new ErrorHandler(`You do not have permission to perform this action!`, 403));
    });
};
