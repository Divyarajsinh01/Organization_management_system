const multer = require('multer');
const ErrorHandler = require('../utils/errorHandler');

// const storage = multer.memoryStorage()
const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits : {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter(req, file, cb) {
        // Check if the file is an image (jpg, png, jpeg)
        if (file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            // It's an image file, pass it through
            cb(undefined, true);
        }
        // Check if the file is an Excel file (xlsx, xls)
        else if (file.originalname.match(/\.(xlsx|xls)$/)) {
            // It's an Excel file, pass it through
            cb(undefined, true);
        } 
        // If it's neither an image nor an Excel file
        else {
            return cb(new ErrorHandler('Please upload either an image (jpg, png, jpeg) or an Excel file (.xlsx, .xls)', 400));
        }
    }
});


module.exports = {upload};