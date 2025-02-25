const catchAsyncError = require("./catchAsyncError");
const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler'); // Assuming you have a custom error handler
const { verifyToken } = require("../utils/tokenUtils");
const db = require("../models");
const LoginToken = db.LoginToken;
const User = db.User;
const UserRole = db.UserRole;


module.exports = catchAsyncError(async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ErrorHandler('Authentication token is missing or invalid', 401));
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = verifyToken(token)
        // console.log(decoded)

        const user = await User.findOne({
            where: { user_id: decoded.id },
            // attributes: {exclude: ['password']},
            include: [{
                model: UserRole,
                as: 'role'
            }]
        });
        if (!user) {
            return next(new ErrorHandler('Access Denied! You are not register. Please register first!', 401));
        }

        if(user.is_disabled){
            return next(new ErrorHandler('Your account is disabled. Please contact support', 401));
        }

        const authToken = await LoginToken.findOne({ where: { token, user_id: user.user_id } })
        if (!authToken) {
            return next(new ErrorHandler('Authentication token is invalid or expired', 401));
        }

        req.user = user;
        req.token = authToken
        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
});
