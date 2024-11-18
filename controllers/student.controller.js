const { Op } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { User, sequelize, Standard, Organization, Student, UserRole, Batch } = require('../models');
const ErrorHandler = require("../utils/errorHandler");
const { generateRandomPassword } = require("../utils/generateRandomPassword");

exports.createStudents = catchAsyncError(async (req, res, next) => {
    const { name, email, mobileNo, address, role_id, standard_id, batch_id, organization_id } = req.body;

    if (!name || !email || !mobileNo || !address || !role_id || role_id === null || !standard_id || !batch_id || !organization_id) {
        return next(new ErrorHandler("Please fill all the fields", 400));
    }

    const isUser = await User.findOne({
        where: {
            [Op.or]: [
                { email },
                { mobileNo }
            ]
        }
    })

    if (isUser) {
        return next(new ErrorHandler("This email or mobile number is already in use!", 400));
    }

    const randomPassword = generateRandomPassword();
    const transaction = await sequelize.transaction()

    try {
        const user = await User.create({
            name,
            email,
            mobileNo,
            password: randomPassword,
            login_id: email,
            address,
            role_id
        }, { transaction })

        const isStandard = await Standard.findOne({ where: { standard_id: standard_id } }, { transaction })
        if (!isStandard) {
            await transaction.rollback()
            return next(new ErrorHandler("Standard not found", 404))
        }

        const isBatch = await isStandard.getBatches({ where: { batch_id } }, { transaction })

        if (isBatch.length <= 0) {
            await transaction.rollback()
            return next(new ErrorHandler('Batch is not available for this standard', 400))
        }

        const isOrganization = await Organization.findOne({
            where: { organization_id }
        }, { transaction })

        if (!isOrganization) {
            await transaction.rollback()
            return next(new ErrorHandler('Organization not found', 404))
        }

        await Student.create({
            user_id: user.user_id,
            standard_id,
            batch_id,
            organization_id
        }, { transaction })

        await transaction.commit()
        const studentData = await User.findOne({
            where: { user_id: user.user_id },
            include: [
                {
                    model: UserRole,
                    as: 'role'
                },
                {
                    model: Student,
                    include: [
                        {
                            model: Standard,
                        },
                        {
                            model: Batch,
                        },
                        {
                            model: Organization,
                        }
                    ]
                }
            ]
        })

        res.status(200).json({
            success: true,
            message: 'Student created successfully!',
            data: {
                ...studentData.toJSON(),
                password: randomPassword
            }
        })

    } catch (error) {
        await transaction.rollback()
        return next(new ErrorHandler(error.message, 500))
    }
})

exports.getStudentProfile = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.user_id
    const student = await User.findOne({
        where: { user_id },
        attributes: { exclude: ['password'] },
        include: [
            {
                model: Student,
                required: true,
                include: [
                    {
                        model: Standard
                    },
                    {
                        model: Batch
                    }, {
                        model: Organization
                    }
                ]
            }
        ]
    })

    if (!student) {
        return next(new ErrorHandler('student not found!', 400))
    }

    res.status(200).json({
        success: true,
        message: 'Student profile fetch successfully!',
        data: student
    })
})

// studentController.js
exports.getStudentList = catchAsyncError(async (req, res, next) => {
    const { name, limit, page, standard_id, batch_id } = req.body;

    let options = {
        where: {}
    };

    const userWhere = {}

    if(name){
        userWhere.name = { [Op.like]: `%${name}%` }
    }

    // If 'limit' and 'page' are passed, apply pagination
    if (limit && page) {
        const offset = (page - 1) * limit;

        options.limit = Number(limit);
        options.offset = offset;
    }

    // Add conditions to the where clause
    if (standard_id) {
        options.where.standard_id = standard_id;
    }

    if (batch_id) {
        options.where.batch_id = batch_id;
    }

    // Include associated data (Standard, Batch, Organization)
    options.include = [
        { model: User, where: userWhere ,attributes: { exclude: ['password'] } },
        { model: Standard },
        { model: Batch },
        { model: Organization }
    ];

    // Fetch students with applied conditions
    const students = await Student.findAndCountAll(options);

    // Calculate pagination info
    const totalPages = Math.ceil(students.count / limit);
    const pagination = {};

    if (page < totalPages) {
        pagination.next = { page: page + 1, limit };
    }
    if (page > 1) {
        pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
        success: true,
        message: 'Student list fetched successfully!',
        data: students.rows,
        total: students.count,
        pagination
    });
});