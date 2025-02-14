const ErrorHandler = require("../utils/errorHandler");
const newrelic = require('newrelic')

module.exports = (err, req, res, next) => {
    newrelic.noticeError(err)
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    err.data = err.data || null;

    // Wrong Mongodb Id error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again `;
        err = new ErrorHandler(message, 400);
    }

    // JWT EXPIRE error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired, Try again `;
        err = new ErrorHandler(message, 400);
    }

    if (err.code === 413) {
        err = new ErrorHandler('File size limit has been reached', 413); // 413 Payload Too Large
    }

    res.status(err.statusCode).json({
        success: false,
        statusCode: err.statusCode,
        message: err.message,
        data: err.data,
    });
};
