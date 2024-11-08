const catchAsyncError = require("../middlewares/catchAsyncError"); // Middleware to catch async errors
const db = require('../models/index')
const Organization = db.Organization
const ErrorHandler = require("../utils/errorHandler"); // Custom error handler utility
const cloudinaryUpload = require("../utils/fileUploader"); // Utility for uploading files to Cloudinary

// Controller to add a new organization
exports.addOrganizations = catchAsyncError(async (req, res, next) => {
    const { organization_name, address, organization_time } = req.body; // Destructure fields from request body

    // Check if logo file is provided
    if (!req.file) {
        return next(new ErrorHandler('Please provide organization logo', 400)); // Return error if logo is missing
    }

    // Check if all required fields are filled
    if (!organization_name || !organization_time || !address) {
        return next(new ErrorHandler('Please fill in all fields', 400)); // Return error if any field is missing
    }

    // Check if organization already exists in the database
    const isOrganizationExist = await Organization.findOne({ where: { organization_name } });
    if (isOrganizationExist) {
        return next(new ErrorHandler('Organization already exists!', 400)); // Return error if organization exists
    }

    let logo; // Variable to store the logo URL
    try {
        // Upload the logo to Cloudinary
        logo = await cloudinaryUpload(req.file.buffer, req.file.mimetype);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500)); // Return error if upload fails
    }

    // Create the organization in the database
    const organization = await Organization.create({
        organization_name,
        address,
        organization_time,
        logo
    });

    // Send success response with the newly created organization data
    res.status(200).json({
        success: true,
        message: 'Organization created successfully!',
        data: organization
    });
});

// Controller to get all organizations
exports.getAllOrganizations = catchAsyncError(async (req, res, next) => {
    // Retrieve all organizations from the database
    const organizations = await Organization.findAll({});
    
    // Check if no organizations were found
    if (organizations.length <= 0) {
        return next(new ErrorHandler('No organizations found', 404)); // Return error if no organizations exist
    }

    // Send success response with the list of organizations
    res.status(200).json({
        success: true,
        message: 'Organizations fetched successfully!',
        data: organizations
    });
});

// Controller to update an existing organization
exports.updateOrganization = catchAsyncError(async (req, res, next) => {
    const { organization_id, organization_name, address, organization_time } = req.body; // Destructure fields from request body

    // Check if the organization exists in the database
    const isOrganizationExist = await Organization.findOne({ where: { organization_id: organization_id } });
    if (!isOrganizationExist) {
        return next(new ErrorHandler('Organization not found!', 404)); // Return error if organization not found
    }

    let logo; // Variable to store the logo URL
    try {
        // Check if a new logo file is provided
        if (req.file) {
            logo = await cloudinaryUpload(req.file.buffer, req.file.mimetype); // Upload the new logo
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500)); // Return error if upload fails
    }

    // Update the organization in the database
    await isOrganizationExist.update({
        organization_name,
        address,
        organization_time,
        logo // Include the new logo if provided
    });

    // Send success response with the updated organization data
    res.status(200).json({
        success: true,
        message: 'Organization updated successfully!',
        data: isOrganizationExist
    });
});

// Controller to delete an organization
exports.deleteOrganization = catchAsyncError(async (req, res, next) => {
    const { organization_id } = req.body; // Destructure organization_id from request body
    
    // Check if the organization exists in the database
    const isOrganizationExist = await Organization.findOne({ where: { organization_id: organization_id } });
    if (!isOrganizationExist) {
        return next(new ErrorHandler('Organization not found!', 404)); // Return error if organization not found
    }

    // Delete the organization from the database
    await isOrganizationExist.destroy();

    // Send success response confirming deletion
    res.status(200).json({
        success: true,
        message: 'Organization deleted successfully!'
    });
});
