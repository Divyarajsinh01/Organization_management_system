const { Op } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const {Manager, User, UserRole, sequelize} = require('../models')
const ErrorHandler = require("../utils/errorHandler");
const cloudinaryUpload = require("../utils/fileUploader");
const { generateRandomPassword } = require("../utils/generateRandomPassword");
const removeSensitiveInfo = require("../utils/removeSensitiveInfo");
const { validateTimeFormat } = require("../utils/validation");
const generateLoginIdWithRandom = require("../utils/randomLoginIdGenerate");

exports.createManagerBySuperAdmin = catchAsyncError(async (req, res, next) => {
    const { name, email, mobileNo, address, timing } = req.body;
    const role_id = 2; //super admin
    const role = await UserRole.findOne({ where: {role_id} });
    if(!role) return next(new ErrorHandler("Role not found", 404));

    // Validate required fields
    if (!name || !email || !mobileNo || !address || !timing) {
        return next(new ErrorHandler("Please fill all the fields", 400));
    }

    const randomPassword = generateRandomPassword()

    // Start a transaction
    const t = await sequelize.transaction();

    try {
        // Check if a super admin with the same email already exists
        const isManager = await User.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { mobileNo }
                ]
            },
            transaction: t  // Pass the transaction object
        });

        if (isManager) {
            // Rollback the transaction if email or mobileNo already exists
            await t.rollback();
            return next(new ErrorHandler("This email or mobile number is already in use!", 400));
        }

        const login_id = await generateLoginIdWithRandom(role.role, User)

        // Create new manager (User)
        const manager = await User.create({
            name,
            email,
            mobileNo,
            password: randomPassword,
            address,
            login_id,  // Assign email as login_id
            role_id
        }, { transaction: t }); // Pass the transaction object

        // Create the Manager record associated with the user
        await Manager.create({
            user_id: manager.user_id,
            timing
        }, { transaction: t }); // Pass the transaction object

        // Commit the transaction after both create operations
        await t.commit();

        // Fetch newly created user along with the role and manager info
        const user = await User.findOne({
            where: { email },
            include: [{
                model: Manager,
                as: 'manager'
            }, {
                model: UserRole,
                as: 'role'
            }]
        });

        // Respond with success and user data
        res.status(200).json({
            success: true,
            message: 'Manager created successfully',
            data: { ...user.toJSON(), password: randomPassword } // Password might be sensitive; consider removing it
        });

    } catch (error) {
        // If any error occurs, rollback the transaction
        await t.rollback();
        return next(new ErrorHandler(error.message, 400));
    }
})

exports.getAllManagerBySuperAdmin = catchAsyncError(async (req, res, next) => {
    const managers = await User.findAll({
        where: { role_id: 2 },
        attributes: { exclude: ['password'] },
        include: [{
            model: Manager,
            attributes: ['timing', 'manager_id'],
            as: 'manager'
        }]
    })

    if (managers.length <= 0) {
        return next(new ErrorHandler('managers data is not available!!', 400))
    }


    res.status(200).json({
        success: true,
        message: 'managers data fetched successfully',
        data: managers
    })
})

exports.getManagerProfile = catchAsyncError(async (req, res, next) => {
    const manager = req.user
    const managerDetails = await Manager.findOne({
        where: { user_id: manager.user_id },
        attributes: ['timing']
    })

    if (!managerDetails) {
        return next(new ErrorHandler('Manager profile not found', 400))
    }

    const managerData = removeSensitiveInfo(manager)

    res.status(200).json({
        success: true,
        message: 'Manager profile fetched successfully',
        data: {
            ...managerData,
            manager: managerDetails
        }
    })
})

exports.managerUpdateProfile = catchAsyncError(async (req, res, next) => {
    const manager = req.user

    const managerDetails = await Manager.findOne({
        where: { user_id: manager.user_id },
        attributes: ['timing']
    })

    if (!managerDetails) {
        return next(new ErrorHandler('Manager details not found', 400))
    }

    let profileImage

    if (req.file) {
        profileImage = await cloudinaryUpload(req.file.buffer, req.file.mimetype)
    }

    await manager.update({
        profile_image: profileImage || manager.profile_image
    })

    const managerData = removeSensitiveInfo(manager)

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            ...managerData,
            managerDetails
        }
    })
})

exports.deleteManagers = catchAsyncError(async (req, res, next) => {
    const { manager_id } = req.body

    if (!manager_id) {
        return next(new ErrorHandler('Please provide manager id', 400))
    }

    const manager = await User.findOne({ where: { user_id: manager_id } })
    if (!manager) {
        return next(new ErrorHandler('Manager not found!', 404))
    }

    await manager.destroy()
    res.status(200).json({
        success: true,
        message: 'Manager deleted successfully!!',
    })
})