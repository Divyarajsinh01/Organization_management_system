const cloudinary = require('../config/cloudinaryConfig'); // Ensure this points to your Cloudinary configuration
const ErrorHandler = require('./errorHandler');
// const { v4: uuidv4 } = require('uuid')

const cloudinaryUpload = async (fileBuffer, fileMimeType) => {
    try {
        // Convert the file buffer to a base64 string
        const base64String = fileBuffer.toString('base64');

        //generate uniques public id
        // const uniqueId = uuidv4();
        
        // Create the base64 data URL
        const dataUrl = `data:${fileMimeType};base64,${base64String}`;

        // Upload the image using the base64 data URL
        const res = await cloudinary.uploader.upload(dataUrl, {
            resource_type: 'auto',
            folder: 'Dashboard/image/organization_management_sys', // Specify the folder or any other parameters
        });
        // console.log(res)
        return res.secure_url; // Return the result from Cloudinary
    } catch (error) {
        throw new ErrorHandler('Failed to upload image: ' + error.message);
    }
}

module.exports = cloudinaryUpload
