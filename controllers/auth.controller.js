const catchAsyncError = require("../middlewares/catchAsyncError"); // Middleware to catch async errors
const db = require('../models/index')
const LoginToken = db.LoginToken
const User = db.User
const { generateToken, verifyToken } = require("../utils/tokenUtils"); // Utilities for generating and verifying tokens
const { verifyHashPassword } = require("../utils/passwordUtils"); // Utility for verifying hashed passwords
const removeSensitiveInfo = require("../utils/removeSensitiveInfo"); // Utility to remove sensitive user info from responses
const { generateOTP } = require("../utils/generateOTP"); // Utility for generating OTPs
const { sendOTP } = require("../utils/smsUtility"); // Utility for sending OTPs via SMS
const ErrorHandler = require("../utils/errorHandler"); // Custom error handler utility
const cloudinaryUpload = require("../utils/fileUploader");
const sendEmail = require("../utils/sendEmail");
const messaging = require("../firebaseConfig");

// Controller for user login
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { login_id, password } = req.body; // Destructure fields from request body
    // Check if both login ID and password are provided
    if (!login_id || !password) {
        return next(new ErrorHandler("Please fill all the fields", 400)); // Return error if fields are missing
    }

    // Find user based on login_id
    const user = await User.findOne({ where: { login_id: login_id } });
    if (!user) {
        return next(new ErrorHandler('You are not registered!', 404)); // Return error if user not found
    }

    if(user.is_disabled){
        return next(new ErrorHandler('Your account is disabled. Please contact support', 401));
    }

    // Verify the provided password
    const isPasswordValid = await verifyHashPassword(password, user.password);
    if (!isPasswordValid) {
        return next(new ErrorHandler('Invalid password!', 400)); // Return error if password is incorrect
    }

    // Check for existing login token for the user
    const isLoginToken = await LoginToken.findOne({ where: { user_id: user.user_id } });
    // Generate a new token for the user
    const token = generateToken({ id: user.user_id });

    // Create a new login token or update the existing one
    if (!isLoginToken) {
        await LoginToken.create({
            user_id: user.user_id,
            token
        });
    } else {
        isLoginToken.token = token; // Update the existing token
        await isLoginToken.save();
    }

    // Remove sensitive user information before sending the response
    const superAdmin = removeSensitiveInfo(user);

    // Send success response with user data and token
    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: superAdmin,
        token
    });
});

// Controller for user logout
exports.logoutUser = catchAsyncError(async (req, res, next) => {
    const token = req.token;  // Extract token from the request

    await token.destroy();  // Delete the token from the database

    // Send success response confirming logout
    res.status(200).json({
        success: true,
        message: 'You logged out successfully!'
    });
});

// Controller for changing user password
exports.changePassword = catchAsyncError(async (req, res, next) => {
    const { old_password, new_password } = req.body; // Destructure fields from request body
    const user = req.user; // Get the authenticated user from request

    // Check if old password is provided
    if (!old_password) {
        return next(new ErrorHandler('Old password is required!', 400));
    }

    // Check if new password is provided
    if (!new_password) {
        return next(new ErrorHandler('New password is required!', 400));
    }

    // Verify the old password
    const isOldPasswordCorrect = await verifyHashPassword(old_password, user.password);
    if (!isOldPasswordCorrect) {
        return next(new ErrorHandler('Old password is incorrect', 400)); // Return error if old password is incorrect
    }

    // Update the user password
    await user.update({
        password: new_password
    });

    // Send success response confirming password change
    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
});

// Controller for sending OTP for forgotten password
exports.sendForgotPasswordOtp = catchAsyncError(async (req, res, next) => {
    const { login_id, mobileNo, email } = req.body; // Destructure mobile number from request body

    // Check if mobile number is provided
    if (!login_id) {
        return next(new ErrorHandler('login_id is required!', 400)); // Return error if missing
    }

    if (!mobileNo && !email) {
        return next(new ErrorHandler('Either mobileNo or email is required!', 400)); // Return error
    }

    // Find user based on mobile number
    const user = await User.findOne({ where: { login_id } });
    if (!user) {
        return next(new ErrorHandler('login ID you provided is not valid or incorrect!', 404)); // Return error if user not found
    }

    // If mobileNo is provided, validate it
    if (mobileNo && user.mobileNo !== mobileNo) {
        return next(new ErrorHandler('Mobile number you provided is not valid or incorrect!', 404)); // Mobile number mismatch
    }

    // If email is provided, validate it
    if (email && user.email !== email) {
        return next(new ErrorHandler('Email you provided is not valid or incorrect!', 404)); // Email mismatch
    }

    // Generate OTP and create a token containing it
    const otp = generateOTP(1000, 9999);
    const token = generateToken({ id: user.user_id, otp }, '5m'); // Token expires in 5 minutes

    if (mobileNo) {
        await sendOTP(otp, mobileNo); // Send the OTP via SMS
    }

    if (email) {
        await sendEmail(email, 'Your Forgot Password OTP', `Your OTP is ${otp}`); // Send the OTP via email
    }

    // Send success response with the OTP token
    res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        otpToken: token
    });
});

// Controller for verifying OTP
exports.verifyOTP = catchAsyncError(async (req, res, next) => {
    const { otp, token } = req.body; // Destructure OTP and token from request body

    // Check if token is provided
    if (!token) {
        return next(new ErrorHandler('Token is required!', 400));
    }

    // Check if OTP is provided
    if (!otp) {
        return next(new ErrorHandler('OTP is required!', 400));
    }

    const decoded = verifyToken(token); // Verify and decode the token

    // Check if the OTP matches the decoded value
    if (decoded.otp !== parseInt(otp)) {
        return next(new ErrorHandler('Invalid OTP', 400)); // Return error if OTP is incorrect
    }

    // Generate a new reset token valid for 15 minutes
    const resetToken = generateToken({ id: decoded.id }, '15m');

    // Send success response with the reset token
    res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        resetToken
    });
});

// Controller for resetting login password
exports.resetLoginPassword = catchAsyncError(async (req, res, next) => {
    // console.log("resetPassword endpoint reached"); // Initial log for debugging
    const { resetToken, new_password } = req.body; // Destructure reset token and new password from request body

    // Check if new password is provided
    if (!new_password) {
        return next(new ErrorHandler('Please provide password', 400));
    }

    // Check if reset token is provided
    if (!resetToken) {
        return next(new ErrorHandler('Token is required!', 400));
    }

    const decoded = verifyToken(resetToken); // Verify and decode the reset token
    const user = await User.findByPk(decoded.id); // Find user based on ID from the decoded token

    // Check if user exists
    if (!user) {
        return next(new ErrorHandler('Your account is not found', 400)); // Return error if user not found
    }

    // Update the user password
    await user.update({
        password: new_password
    });

    // Send success response confirming password reset
    res.status(200).json({
        success: true,
        message: 'Password reset successfully!'
    });
});

//update useProfile

exports.updateProfilePic = catchAsyncError(async (req, res, next) => {
    const user = req.user

    const profile_image = await cloudinaryUpload(req.file.buffer, req.file.mimetype)

    await user.update({
        profile_image
    })

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
    })
})

// send test notification 

const registrationToken = 'eCzc85C4SvKHwDqh8o_6XG:APA91bEVAwPNBaza8RY4FBN6fGKic9QhPoG1sx4RSRylIsAXgmr0Si-q37Fgy7XksaNl50aWBHh3Zhm7YUIWAx3x-yf_G2HCCjOFNnEYP3BBJQi8RTGGfKE';

exports.testPushNotification = catchAsyncError(async (req, res, next) => {
    const message = {
        notification: {
            title: 'test notification',
            body: 'this is test data from nodejs'
        },
        token: registrationToken
      };

      // Send a message to the device corresponding to the provided
      // registration token.
    const messageData = await messaging.send(message)
    res.status(200).json({
        data: messageData
    })
})

exports.saveUserFCMTokens = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.user_id

    const { fcm_token } = req.body

    const isToken = await db.UserFCM.findOne({ where: { user_id } })

    if (isToken) {
        await isToken.update({
            FCM_Token: fcm_token
        })
    } else {
        await db.UserFCM.create({
            user_id,
            FCM_Token: fcm_token
        })
    }

    res.status(200).json({
        success: true,
        message: 'User FCM Token Store successfully!',
    })
})

// user disabled...

exports.disableUser = catchAsyncError(async (req, res, next) => {
    const { user_id } = req.body
    const user = await db.User.findOne({ where: { user_id } })
    if (!user) {
        return next(new ErrorHandler('User not found', 400))
    }

    // Check if the user is already disabled
    if (user.is_disabled) {
        return next(new ErrorHandler("User is already disabled.", 400));
    }

    // Disable the user
    await user.update({
        is_disabled: true
    });

    // destroy all login session

    await LoginToken.destroy({ where: { user_id } })

    // Send success response
    res.status(200).json({
        success: true,
        message: 'User disabled successfully!',
    });
})

// unable user to login

exports.enableUser = catchAsyncError(async (req, res, next) => {
    const { user_id } = req.body

    const user = await db.User.findOne({ where: { user_id } })
    if (!user) {
        return next(new ErrorHandler('User not found', 400))
    }
    // Check if the user is already enabled
    if (!user.is_disabled) {
        return next(new ErrorHandler("User is already enabled.", 400));
    }
    // Enable the user
    await user.update({
        is_disabled: false
    });
    // Send success response
    res.status(200).json({
        success: true,
        message: 'User enabled successfully!',
    });
})

// exports.deleteUser = catchAsyncError(async (req, res, next) => {
//     const { user_id } = req.body

//     const user = await db.User.findOne({ where: { user_id } })
//     if (!user) {
//         return next(new ErrorHandler('User not found', 400))
//     }
    
//     // Check if the user role base 

//     const role_id = user.role_id


// })