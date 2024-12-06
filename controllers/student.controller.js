const { Op } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { User, sequelize, Standard, Organization, Student, UserRole, Batch } = require('../models');
const ErrorHandler = require("../utils/errorHandler");
const { generateRandomPassword } = require("../utils/generateRandomPassword");
const generateLoginIdWithRandom = require("../utils/randomLoginIdGenerate");
const { validateDate } = require("../utils/validation");
const moment = require('moment')

exports.createStudents = catchAsyncError(async (req, res, next) => {
    //request body
    const { name, email, mobileNo, address, mobileNo2,DOB, gender, standard_id, batch_id, organization_id, wantToProcess } = req.body;

    // validation for all fields
    if (!name || !email || !mobileNo || !address || !standard_id || !gender || !batch_id || !organization_id || !DOB) {
        return next(new ErrorHandler("Please fill all the fields", 400));
    }

    validateDate(DOB)

    // check if email or mobile no already exists
    const isUser = await Student.findAll({
        include: [
            {
                model: User,
                where: {
                    [Op.and]: [
                        { email },
                        { mobileNo }
                    ]
                },
            },
            { model: Standard },
            { model: Batch },
        ]
    })

    // console.log(isUser)

    if (isUser.length > 0 && !wantToProcess) {
        return next(new ErrorHandler("This email or mobile number is already in use!", 400, isUser));
    }

    const role_id = 4; // student role id

    // role validation
    const role = await UserRole.findOne({ where: { role_id } });
    if (!role) return next(new ErrorHandler("Role not found", 404));

    // random password generation
    // const randomPassword = generateRandomPassword();

    // random login id generation

    const login_id = await generateLoginIdWithRandom(role.role, User)

    // transaction start
    const transaction = await sequelize.transaction()

    try {
        const user = await User.create({
            name,
            email,
            mobileNo,
            mobileNo2: mobileNo2 || null,
            gender, 
            password: 'Student@123', // default password
            login_id,
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

        const DOBFormate = moment(`${DOB}`, "DD/MM/YYYY").format('YYYY-MM-DD');

        await Student.create({
            user_id: user.user_id,
            standard_id,
            batch_id,
            DOB: DOBFormate,
            organization_id
        }, { transaction })

        await transaction.commit()
        const studentData = await User.findOne({
            where: { user_id: user.user_id },
            attributes: {exclude : ['password']},
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
            data: studentData
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

    if (name) {
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
        { model: User, where: userWhere, attributes: { exclude: ['password'] } },
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

exports.updateStudents = catchAsyncError(async (req, res, next) => {
    const { user_id, name, email, mobileNo, address, standard_id, batch_id, organization_id } = req.body;

    // if (!name || !email || !mobileNo || !address || !standard_id || !batch_id || !organization_id) {
    //     return next(new ErrorHandler("Please fill all the fields", 400));
    // }

    if (!user_id) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    const transaction = await sequelize.transaction()

    try {
        // Find the student record with user_id
        const student = await Student.findOne({
            where: { user_id },
            include: [{ model: User }]  // Including the associated User record
        });

        if (!student) {
            await transaction.rollback();
            return next(new ErrorHandler('Student not found', 404));
        }

        // If the student is found, find the associated user record
        const user = student.user;

        // Only update fields that are provided in the request body
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (mobileNo) updateData.mobileNo = mobileNo;
        if (address) updateData.address = address;

        // Update the user details
        await user.update(updateData, { transaction });

        if (standard_id) {
            const isStandard = await Standard.findOne({ where: { standard_id } }, { transaction });
            if (!isStandard) {
                await transaction.rollback();
                return next(new ErrorHandler("Standard not found", 404));
            }

            // Check if the batch_id has changed
            if (batch_id) {
                const isBatch = await isStandard.getBatches({ where: { batch_id } }, { transaction });
                if (isBatch.length <= 0) {
                    await transaction.rollback();
                    return next(new ErrorHandler('Batch is not available for this standard', 400));
                }
            }
        }

        // If a new organization is provided, validate it
        if (organization_id) {
            const isOrganization = await Organization.findOne({
                where: { organization_id }
            }, { transaction });

            if (!isOrganization) {
                await transaction.rollback();
                return next(new ErrorHandler('Organization not found', 404));
            }
        }

        // Update student's standard, batch, and organization if they have changed
        const updatedFields = {};
        if (standard_id && standard_id !== student.standard_id) updatedFields.standard_id = standard_id;
        if (batch_id && batch_id !== student.batch_id) updatedFields.batch_id = batch_id;
        if (organization_id && organization_id !== student.organization_id) updatedFields.organization_id = organization_id;

        await student.update(updatedFields, { transaction });
        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Student updated successfully!',
        })

    } catch (error) {
        await transaction.rollback()
        return next(new ErrorHandler(error.message, 500))
    }
})