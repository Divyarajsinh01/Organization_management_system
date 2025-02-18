const { Op } = require("sequelize");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { User, sequelize, Standard, Organization, Student, UserRole, Batch, StandardFees, Installment, StudentFees, StudentPayment } = require('../models');
const ErrorHandler = require("../utils/errorHandler");
const { generateRandomPassword } = require("../utils/generateRandomPassword");
const generateLoginIdWithRandom = require("../utils/randomLoginIdGenerate");
const { validateDate } = require("../utils/validation");
const moment = require('moment')
const ExcelJS = require('exceljs');

exports.createStudents = catchAsyncError(async (req, res, next) => {
    //request body
    const { name, email, mobileNo, address, mobileNo2, DOB, gender, standard_id, batch_id, organization_id, wantToProcess } = req.body;

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

        const student = await Student.create({
            user_id: user.user_id,
            standard_id,
            batch_id,
            DOB: DOBFormate,
            organization_id
        }, { transaction })

        const standardFees = await StandardFees.findOne({ where: { standard_id }, transaction })

        if (standardFees) {
            const installments = await Installment.findAll({ where: { fees_id: standardFees.fees_id }, transaction })

            const studentFees = {
                fees_id: standardFees.fees_id,
                student_id: student.student_id,
                pending_fees: standardFees.fees,
            }

            const studentInstallments = installments.map(installment => ({
                installment_id: installment.installment_id,
                student_id: student.student_id,
            }));

            await StudentFees.create(studentFees, { transaction });

            await StudentPayment.bulkCreate(studentInstallments, { transaction });
        }

        await transaction.commit()
        const studentData = await User.findOne({
            where: { user_id: user.user_id },
            attributes: { exclude: ['password'] },
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


exports.downloadExcelDemoForStudent = catchAsyncError(async (req, res, next) => {
    const studentSampleData = [
        {
            "name": "John Doe",
            "email": "johndoe@gmail.com",
            "mobileNo": "9889998877",
            "gender": "Male",
            "DOB": "01/01/2000",
            "address": "Test Address"
        },
        {
            "name": "Jane Smith",
            "email": "janesmith@gmail.com",
            "mobileNo": "9778889990",
            "gender": "Female",
            "DOB": "02/02/1999",
            "address": "Another Test Address"
        }
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Sample Data');

    // Add Header Row (Bold & Styled)
    worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Mobile No', key: 'mobileNo', width: 15 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'DOB', key: 'DOB', width: 15 },
        { header: 'Address', key: 'address', width: 30 }
    ];

    // Making header bold
    worksheet.getRow(1).font = { bold: true };

    // Add Data Rows
    studentSampleData.forEach(student => {
        worksheet.addRow(student);
    });

    // Set response headers for file download
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=student_sample_data.xlsx"
    );

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // // Send file buffer as response
    await workbook.xlsx.write(res);
    res.end();
});

exports.importStudentDataFile = catchAsyncError(async (req, res, next) => {
    const file = req.file;
    const { standard_id, batch_id, organization_id } = req.body
    if (!standard_id || !batch_id || !organization_id) return next(new ErrorHandler("Please provide standard, batch, and organization", 400));

    // Validate the file type (Excel file)
    if (!file || !file.originalname.match(/\.(xlsx|xls)$/)) {
        return next(new ErrorHandler("Please upload a valid Excel file (.xlsx or .xls)", 400));
    }

    const role_id = 4; // student role id

    // role validation
    const role = await UserRole.findOne({ where: { role_id } });
    if (!role) return next(new ErrorHandler("Role not found", 404));

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];

    const studentData = []
    const errors = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const [name, email, mobileNo, gender, DOB, address] = row.values.slice(1)

        // Validate required fields
        if (!name || !email || !mobileNo || !DOB || !address) {
            errors.push(`Missing filed at row ${rowNumber}`);
        }

        validateDate(DOB)

        // Extract the email text if it's an object (hyperlink format)
        const emailText = typeof email === 'object' && email.text ? email.text : email;
        // Log data to inspect their types
        // console.log({ name, email: emailText, mobileNo, gender, DOB, address });
        studentData.push({ name, email: emailText, mobileNo: mobileNo.toString(), gender, DOB, address })
    })

    if (errors.length > 0) {
        return next(new ErrorHandler(errors.join(" | "), 400));
    }

    const transaction = await sequelize.transaction()
    try {
        for (const student of studentData) {
            const login_id = await generateLoginIdWithRandom(role.role, User)
            const { name, email, mobileNo, gender, DOB, address } = student
            const user = await User.create({
                name,
                email,
                mobileNo,
                gender,
                password: 'Student@123', // default password
                login_id,
                address,
                role_id
            }, { transaction })

            const DOBFormate = moment(`${DOB}`, "DD/MM/YYYY").format('YYYY-MM-DD');

            const createdStudent = await Student.create({
                user_id: user.user_id,
                standard_id,
                batch_id,
                DOB: DOBFormate,
                organization_id
            }, { transaction })

            const standardFees = await StandardFees.findOne({ where: { standard_id }, transaction })

            if (standardFees) {
                const installments = await Installment.findAll({ where: { fees_id: standardFees.fees_id }, transaction })

                const studentFees = {
                    fees_id: standardFees.fees_id,
                    student_id: createdStudent.student_id,
                    pending_fees: standardFees.fees,
                }

                const studentInstallments = installments.map(installment => ({
                    installment_id: installment.installment_id,
                    student_id: createdStudent.student_id,
                }));

                await StudentFees.create(studentFees, { transaction });

                await StudentPayment.bulkCreate(studentInstallments, { transaction });
            }
        }
        await transaction.commit();
        res.status(200).json({ success: true, message: "Students created successfully" });
    } catch (error) {
        await transaction.rollback();
        return next(new ErrorHandler(error.message, 400))
    }
})