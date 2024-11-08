const catchAsyncError = require("../middlewares/catchAsyncError"); // Middleware to handle async errors
const db = require('../models/index')
const UserRole = db.UserRole
const ErrorHandler = require("../utils/errorHandler"); // Custom error handler

// Controller to add a new role
exports.addRoles = catchAsyncError(async (req, res, next) => {
    const { role } = req.body; // Destructure role from request body

    // Check if the role already exists in the database
    const checkRoleExist = await UserRole.findOne({ where: { role } });
    if (checkRoleExist) {
        return next(new ErrorHandler('Role already exists!', 400)); // Return error if role exists
    }

    // Create a new role in the database
    const newRole = await UserRole.create({ role });

    // Send success response with the newly created role data
    res.status(200).json({
        success: true,
        message: 'Role added successfully!',
        data: newRole
    });
});

// Controller to get all roles
exports.getRoles = catchAsyncError(async (req, res, next) => {
    // Retrieve all roles from the database
    const roles = await UserRole.findAll({});

    // Check if no roles were found
    if (roles.length <= 0) {
        return next(new ErrorHandler('No roles found!', 404)); // Return error if no roles found
    }

    // Send success response with the list of roles
    res.status(200).json({
        success: true,
        message: 'Roles fetched successfully!',
        data: roles
    });
});
