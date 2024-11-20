const { Op } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const db = require("../models");
const UserRole = db.UserRole;
const User = db.User;
const ErrorHandler = require("../utils/errorHandler");
const cloudinaryUpload = require("../utils/fileUploader");
const removeSensitiveInfo = require("../utils/removeSensitiveInfo");
const generateLoginIdWithRandom = require("../utils/randomLoginIdGenerate");

// Add Super Admin
exports.addSuperAdmin = catchAsyncError(async (req, res, next) => {
    const { name, email, mobileNo, password, address } = req.body;
    const role_id = 1; //super admin
    const role = await UserRole.findOne({ where: {role_id} });
    if(!role) return next(new ErrorHandler("Role not found", 404));
    let image;

    // Upload image to Cloudinary if file is provided
    if (req.file) {
        image = await cloudinaryUpload(req.file.buffer, req.file.mimetype);
    }

    // Validate required fields
    if (!name || !email || !mobileNo || !password || !address) {
        return next(new ErrorHandler("Please fill all the fields", 400));
    }

    // Check if a super admin with the same email already exists
    // const isSuperAdmin = await User.findOne({
    //     where: {
    //         [Op.or]: [
    //             { email },
    //             { mobileNo }
    //         ]
    //     }
    // })
    
    // if (isSuperAdmin) {
    //     return next(new ErrorHandler("This email or mobile number is already in use!", 400));
    // }

     const login_id = await generateLoginIdWithRandom(role.role, User)
    //  console.log(login_id)

    // Create new super admin with provided data and profile image URL if available
    await User.create({
        name,
        email,
        mobileNo,
        password,
        address,
        login_id,  
        profile_image: image || null
    });

    // // Fetch newly created user along with role
    const user = await User.findOne({
        where: { email },
        include: [{
            model: UserRole,
            as: 'role'
        }]
    });

    // Remove sensitive information before sending response
    const superAdminData = removeSensitiveInfo(user);

    // Respond with success and user data
    res.status(200).json({
        success: true,
        message: 'Super Admin created successfully',
        data: superAdminData
    });
});

// Get Super Admin Profile
exports.getSuperAdminProfile = catchAsyncError(async (req, res, next) => {
    const superAdmin = req.user;  // Fetch current super admin user from request

    // Remove sensitive information from user profile
    const superAdminProfile = removeSensitiveInfo(superAdmin);

    // Send response with the profile data
    res.status(200).json({
        success: true,
        message: 'Super Admin profile fetched successfully',
        data: superAdminProfile
    });
});

// Get All Super Admins
exports.getAllSuperAdmins = catchAsyncError(async (req, res, next) => {
    // Fetch all users with role_id 1, excluding password attribute
    const superAdmins = await User.findAll({
        where: { role_id: 1 },
        attributes: { exclude: 'password' },
        include: [{
            model: UserRole,
            as: 'role'
        }]
    });

    // If no super admins are found, throw an error
    if (superAdmins.length <= 0) {
        return next(new ErrorHandler('No super admin found!', 404));
    }

    // Respond with success and list of super admins
    res.status(200).json({
        success: true,
        message: 'Super Admins data fetched successfully',
        data: superAdmins
    });
});

// Update Super Admin
exports.updateSuperAdmin = catchAsyncError(async (req, res, next) => {
    const { name, email, mobileNo, address } = req.body;
    const superAdmin = req.user;  // Fetch current super admin from request

    let image;

    // Upload new image to Cloudinary if file is provided
    if (req.file) {
        image = await cloudinaryUpload(req.file.buffer, req.file.mimetype);
    }

    // Prepare fields to update
    const updatedFields = {
        name: name || superAdmin.name,            // Use existing name if not provided
        email: email || superAdmin.email,
        mobileNo: mobileNo || superAdmin.mobileNo,
        address: address || superAdmin.address,
        profile_image: image || superAdmin.profile_image  // Use new image or keep existing
    };

    // Update super admin in database with new data
    await superAdmin.update(updatedFields);

    // Remove sensitive information from updated profile
    const updatedData = removeSensitiveInfo(superAdmin);

    // Respond with success and updated data
    res.status(200).json({
        success: true,
        message: 'Super Admin updated successfully',
        data: updatedData
    });
});

// Delete Super Admin
exports.deleteSuperAdmin = catchAsyncError(async (req, res, next) => {
    const superAdmin = req.user;  // Fetch current super admin from request

    // Delete super admin from the database
    await superAdmin.destroy();

    // Respond with success message
    res.status(200).json({
        success: true,
        message: 'Super Admin deleted successfully'
    });
});
